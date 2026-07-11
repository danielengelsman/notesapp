# Bookstead — Hostile QA Attack Report

Adversarial pre-launch QA of the client-side QuickBooks-Desktop conversion app.
Engine tested directly (Node `--experimental-strip-types` + esbuild bundles of
`src/engine/*`); archive and app tested in a real browser via Playwright against
the built static site at `http://localhost:4173/app/`.

All scratch work: `/tmp/claude-0/-home-user-notesapp/39d84e10-e4d5-50b6-b66c-1c29fe900849/scratchpad/qa/`
(engine-tests, malformed-tests, make-archive + pw-archive, pw-ui, pw-merge, lictest).

## Bug count by severity
- **P0 (data-corruption / security): 1**
- **P1 (wrong-result / silent corruption / revenue): 4**
- **P2 (UX / data-quality): 4**

## Single worst bug
**BUG-1 — CSV/TSV formula injection in every export pack (P0).** Untrusted text
(memos, customer/vendor names, account names) is written into the migration-pack
CSV/TSV files with no formula-injection guard. A field like `=cmd|'/c calc'!A1`,
`+2+3`, `-2+3`, or `@SUM(...)` is emitted verbatim; when the accountant opens the
export in Excel / Google Sheets / LibreOffice (the entire point of the pack) the
formula executes — the classic CSV-injection → command-execution / data-exfil
vector. Triggers unconditionally on every download, no user misstep required.

---

## P0

### BUG-1 · Formula (CSV/TSV) injection in exporters — P0 security
**Where:** `src/engine/exporters.ts:16` (`const q = (s) => (/[",\n]/.test(s) ? … : s)`),
and the Manager.io TSV builders that emit raw cells (`exportManager`, lines ~112–123, 171).
`q()` only quotes fields containing `" , \n`; it never neutralises a leading
`= + - @ \t \r`, so spreadsheet formulas survive into `transactions.csv`,
`accounts.csv`, `customers.csv`, `vendors.csv`, `items.csv`, and the Manager `.tsv`s.

**Repro (verified, `engine-tests.mjs`):** memo `=SUM(1+1)`, name `=cmd|'/c calc'!A1`,
account `=SUM(A1:A9)` → all appear byte-for-byte in the generated CSV. Output line:
`DANGER field: "=cmd|'/c calc'!A1"`, `DANGER field: "=SUM(A1:A9)"`, `DANGER field: "+2+3"`.

**Fix:** in `exporters.ts`, before quoting, prefix any cell whose first char is one of
`= + - @ \t \r` with a `'` (or a leading space / wrap `="..."` per your import target),
and apply the same guard to the Manager TSV cell path. Note the QB source can carry
attacker-influenced text (customer-supplied invoice memos, imported descriptions).

---

## P1

### BUG-2 · Sample-company data silently merged into a real company's output — P1 data corruption
**Where:** `src/app/app/page.tsx` — `loadDemo` (76–84), `addFiles` (66–74), `run` (92–116).
Demo files are named `lists.iif`, `txn-detail.csv`, `trial-balance-2025.csv`. `addFiles`
replaces only files whose **name** collides (`prev.filter(p => !loaded.some(l => l.name === p.name))`).
Real exports almost always have different filenames, so the demo files persist alongside them,
and `run`/`buildLedger` merge everything into one ledger.

**Repro (verified, `pw-merge.mjs`):** load sample company → Run → add a real IIF named
`mycompany-accounts.iif` containing account `ZZZ_SECRET_REAL_ACCOUNT` → Run → download archive.
The downloaded archive contains **both** `ZZZ_SECRET_REAL_ACCOUNT` **and** the demo company's
accounts/transactions. The customer's permanent archive and the GnuCash/Manager migration packs
they import are polluted with a second company's books — silently, with no warning. This destroys
the "matches to the penny" trust premise and happens to **licensed** users too.

**Fix:** clear demo-loaded files when the user adds their own (or track a `demoLoaded` flag and
reset it on the first user-supplied file); at minimum warn loudly when demo + user files coexist.

### BUG-3 · Licence unlock bypass via `isDemo` — P1 revenue
**Where:** `src/app/app/page.tsx:110` (`isDemo = files.some(f => f.text === DEMO_TXN_CSV)`) and
`:157` (`unlocked = license != null || (results?.isDemo ?? false)`).
`isDemo` stays `true` as long as the demo transaction file's text is present, so paid downloads
stay unlocked while real files are loaded (same root cause as BUG-2). Worse, `DEMO_TXN_CSV` is
shipped in the JS bundle (`demo-data.ts`), so **any** user can force free downloads of their real
conversion simply by also uploading the (publicly available) demo file.

**Repro (verified, `pw-ui.mjs` / `pw-merge.mjs`):** demo → Run → add real file → Run:
`Download the archive` / `Download the migration pack` remain visible and functional with **no
licence**; the "Sample company — downloads unlocked" banner is even shown over real data.

**Fix:** gate downloads on `license != null` only; treat the demo strictly as a preview
(e.g. watermark or disable real-file mixing), and don't derive entitlement from file contents.
(Note: the Ed25519 licence check itself is sound — see "Verified safe".)

### BUG-4 · Reconciliation false-mismatch on account-numbered trial balances — P1 wrong-result
**Where:** `src/engine/reconcile.ts:43–49` `normalizeAccountLabel`. The leading-account-number
stripper requires a separator character: `/^\s*\d{3,6}(\.\d+)?\s*[·•\-:]\s*/`. A TB that renders
numbers with a **plain space** (`"1000 Checking"`) is not normalised, so it never matches the
rebuilt `"Checking"`.

**Repro (verified, `engine-tests.mjs`):** identical ledger reconciled against two TBs.
`"1000 · Checking"` → matched=2, perfect. `"1000 Checking"` → matched=0,
missingInRebuild=2, missingInQb=2, `perfect=false`. Every numbered account reports as a
mismatch, so a correct conversion is shown to the customer as broken (and blocks the sale).
**Related encoding risk:** the QB middot is byte `0xB7` (Windows-1252); files read via
`File.text()` as UTF-8 turn a lone `0xB7` into U+FFFD, which the `·`/`•` class also won't match —
worth a fixture test with a real QB TB export.

**Fix:** broaden the separator to also accept whitespace-only, e.g.
`/^\s*\d{3,6}(\.\d+)?\s*(?:[·•\-:]\s*|\s+)/`, and normalise smart separators/encoding first.

### BUG-5 · Multiple transaction files parsed under the first file's column map — P1 data loss
**Where:** `src/app/app/page.tsx:98` — `parseTxnReport(txnFiles.map(f => f.text).join("\n"), …)`.
All transaction CSVs are concatenated into one string and parsed once. The header row is only
located in the first ~12 lines, so a second file's header becomes a data row (harmlessly skipped
as an unparseable date) **and** every second-file row is parsed with the first file's column
indices. If the two exports have different column layouts (e.g. one with `Clr/Split/Balance`
columns, one without) the second file's Debit/Credit/Name land in the wrong columns.

**Repro (verified, `pw-ui.mjs`):** demo txn file (wide layout) + `myreal.csv` (narrow layout)
→ the real invoice's amount (`7,777.00`) and name (`RealCustomer LLC`) are absent from the output;
its rows were misparsed/dropped even though the file was accepted. Silent, no warning.

**Fix:** parse each txn file independently (`files.filter(kind==="txn").map(f => parseTxnReport(f.text, f.name))`)
and concatenate the resulting `transactions`, not the raw text.

---

## P2

### BUG-6 · Impossible calendar dates accepted — P2 data quality
**Where:** `src/engine/txnreport.ts:40–43` `normalizeDate`. Validates month 1–12 and day 1–31 but
not day-within-month. `02/30/2024 → 2024-02-30`, `04/31/2024 → 2024-04-31`, `02/31/2024 → 2024-02-31`
(verified). Non-existent dates enter the ledger and archive.
**Fix:** construct a `Date` (or table of month lengths, leap-year aware) and reject if it rolls over.

### BUG-7 · Negative amounts in Debit/Credit columns not normalised — P2
**Where:** `src/engine/txnreport.ts:129–142` / line construction `188–194`. A `-50.00` in the Debit
column yields `debit = -5000` (verified), violating the documented `debit >= 0 / credit >= 0`
invariant (`types.ts:32-34`). Net per-account balance is preserved (`debit - credit`), so totals and
reconciliation are unaffected, but exports/archive show a negative number in a Debit column.
**Fix:** if `debit < 0`, move `-debit` into `credit` (and vice-versa) before pushing the line.

### BUG-8 · Adjacency grouping merges distinct transactions — P2
**Where:** `src/engine/txnreport.ts:163–173`. With no `Trans #` column, two genuinely different
transactions that share Type+Date+Num are merged into one (verified: two distinct checks → 1 txn).
Account balances are preserved (all lines retained) but transaction boundaries in the archive/exports
are wrong. Already partially acknowledged in code comments and warned when the column is absent.
**Fix:** document as a limitation; consider a balance-closes heuristic to split groups.

### BUG-9 · 3-decimal amounts rounded per line — P2 (minor)
**Where:** `src/engine/money.ts:33–35`. `1.005 → 101¢` (half-up on the 3rd decimal, verified).
Fine for matched pairs, but independent per-line rounding could in theory unbalance a transaction
if a report ever emits 3-decimal amounts. QBD GL reports are 2-decimal, so low risk. Note only.

---

## Verified SAFE (attempted and could not break)

- **Archive HTML/JS/DOM injection — SAFE.** Built an archive with payloads in company name,
  memos, names, and accounts: `</script><script>…</script>`, `<img onerror>`, `"><svg onload>`,
  backticks, `${}`, `</script\t>`. Loaded in Chromium (`pw-archive.mjs`): no dialog, no
  `pageerror`, no injected `<img>/<svg>/<script>`, title correctly escaped, all flags unset →
  **"no injection executed"**. Defenses hold: JSON embed does `.replace(/<\//g, "<\\/")`
  (`archive.ts:65`), the viewer `esc()` escapes `& < > "` (`archive.ts:134`), and `<title>` uses
  `escapeHtml` (`archive.ts:82`). All viewer attributes use double quotes, so attribute-break is
  covered.
- **Malformed / binary / empty / headers-only inputs — no crashes.** Empty files, 5 KB random
  binary, a `QBW`-like binary blob, headers-only CSV/IIF, IIF with a missing NAME column, and a txn
  report with no `Trans #` column: all parse to 0 rows with graceful warnings, no exceptions
  (`malformed-tests.mjs`). Windows-1252 smart quotes and embedded newlines in memo fields survive
  intact.
- **10 MB+ performance — fine.** An 11.8 MB transaction CSV (70k transactions) parsed in ~790 ms,
  ledger build 22 ms, archive generation 140 ms (19 MB HTML), full export pack 576 ms (56 MB). No
  pathological blow-up.
- **Licence key crypto & localStorage tampering — sound.** `verifyLicense` (`src/lib/license.ts`)
  rejected empty, garbage, malformed-base64, bad-signature, and wrong-prefix (`PROD2.…`) keys
  (`lictest.mjs`). Tampering `localStorage["bookstead.license"]` with an arbitrary string cannot
  forge entitlement — the signature check gates it. The **only** unlock bypass is `isDemo`
  (BUG-3), not the Ed25519 verification.

## Notes on lower-severity edge cases checked
- Duplicate account names differing only in case (`Cash`/`cash`) dedupe to one (first wins) —
  intended, QBD names are case-insensitive; flagging only so it's a conscious choice.
- Leading/trailing spaces in names are trimmed on parse (`iif.ts` `get()`, `txnreport` `cell()`).
- Empty company name on archive download defaults to `My Company` / `bookstead-archive.html` — fine.
- Run with no files: button is correctly disabled (`page.tsx:211`, verified in `pw-ui.mjs`).
