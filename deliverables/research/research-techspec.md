# Ledgerlift — Technical Format Spec (Research)

Date: 2026-07-11. Scope: implementable format details for a 100% client-side web app that parses QuickBooks Desktop (QBD) exports, rebuilds a double-entry ledger, verifies it, and re-exports to Manager.io / GnuCash / a self-contained HTML archive.

**Research-environment caveat:** this session's egress proxy blocked direct fetches of `quickbooks.intuit.com`, `gnucash.org` wiki/manual HTML, `manager.io`, and `metacpan.org`. Claims below are therefore anchored to (a) **verbatim primary artifacts pulled from GitHub raw** — real QBD `.IIF` exports, real QBD-family transaction-detail CSV exports, GnuCash importer source code and DocBook source — and (b) search-engine extracts of official pages (marked "via search extract" where the page itself could not be loaded). Confidence is flagged per claim. Nothing below is invented; where the record is thin it says so.

---

## 1. IIF format (list exports: !ACCNT, !CUST, !VEND, !INVITEM)

### 1.1 Container basics — HIGH confidence (verified against real export files)

- **Delimiter:** tab (`\t`), one record per line. No escaping mechanism for tabs inside values exists in the format.
- **Encoding:** QBD is a Windows ANSI app; exports observed are plain ASCII, but non-ASCII names arrive as **Windows-1252** (not UTF-8). Decode as `windows-1252`; fall back to UTF-8 only if a BOM is present. (Encoding claim = MEDIUM confidence: samples examined were pure ASCII; Windows-1252 is the community-reported behavior — treat defensively, offer an encoding override.)
- **Line endings:** both CRLF and LF occur in the wild (QB Mac 6.0 sample = CRLF; a QB Enterprise 34 sample = LF, possibly git-normalized). Accept both, plus lone CR.
- **Header rows** begin with `!` followed by the record keyword; the remaining tab-separated cells name the columns for subsequent data rows of that keyword. Multiple `!` headers appear in one file, one per section; data rows carry the keyword (without `!`) in column 0.
- **A single file can redefine the same keyword twice** — verified: both real exports contain **two different `!INVITEM` headers** (full item table, then a shorter group/subtotal-item table before `!ENDGRP`). Parser rule: a `!` row *replaces* the active column map for that keyword from that point down.
- Block markers observed in real exports: `!ENDGRP`, `!CUSTITEMDICT … !ENDCUSTITEMDICT`, `!CUSTNAMEDICT … !ENDCUSTNAMEDICT`, `!QBP EMPLOYEE … !ENDQBPEMP`, `!QB ONLINE`. Skip unknown sections rather than erroring.
- **File header record** (always first):
  - QB Mac 6.0: `!HDR PROD VER REL IIFVER DATE TIME`
  - QB Enterprise (modern): `!HDR PROD VER REL IIFVER DATE TIME ACCNTNT ACCNTNTSPLITTIME`
  - Example data row (Enterprise 34, 2026): `HDR	QuickBooks Enterprise Solutions	Version 34.0D	Release R15P	1	2026-12-15	1797385073	N	0` — note HDR DATE is ISO here but `8/2/2006` in a 2006 Enterprise file. Don't rely on HDR date format.

Sources:
- Real all-lists export (QB Enterprise 34): https://github.com/Pewejekubam/qbd-to-gnucash/blob/main/input/qbd-all-lists-sample.IIF (fetched raw, examined byte-level)
- Real QB Mac 6.0 export: https://github.com/gitpan/Finance-IIF/blob/master/t/sample.iif
- Finance::IIF docs (parser reference): https://metacpan.org/pod/Finance::IIF (mirror examined: https://github.com/gitpan/Finance-IIF/blob/master/lib/Finance/IIF.pm)
- Official Intuit overview + IIF Import Kit landing page (page itself blocked to this session; existence/summary via search extract): https://quickbooks.intuit.com/learn-support/en-us/help-article/list-management/iif-overview-import-kit-sample-files-headers/L5CZIpJne_US_en_US
- Import Kit example files mirrored in-repo: https://github.com/overhacked/square-bridge/tree/master/quickbooks-examples/IIF%20Import%20Kit

### 1.2 !ACCNT — chart of accounts — HIGH confidence (verbatim from two independent real exports)

Modern header (QB 2006 Enterprise through Enterprise 34, identical):

```
!ACCNT  NAME  REFNUM  TIMESTAMP  ACCNTTYPE  OBAMOUNT  DESC  ACCNUM  SCD  BANKNUM  EXTRA  HIDDEN  DELCOUNT  USEID
```
(QB 2006 files add a trailing `WKPAPERREF`; QB Mac 6.0 had only `NAME REFNUM TIMESTAMP ACCNTTYPE OBAMOUNT DESC ACCNUM SCD EXTRA`.)

| Field | Meaning | Notes (observed values) |
|---|---|---|
| NAME | Full account name; **sub-accounts are colon-delimited paths** | `Bank Accounts:WFOp` |
| REFNUM | Internal list ID (int) | stable within file only |
| TIMESTAMP | Unix epoch of last edit | `934380912` |
| ACCNTTYPE | Type code (see table below) | `BANK` |
| OBAMOUNT | Opening balance | **quoted with thousands commas when ≥1000**: `"99,250.02"`, `"-1,725.00"` |
| DESC | Description | may contain literal `\n` two-char sequences |
| ACCNUM | User account number | often empty |
| SCD | Tax-line/schedule code (int) | `1172`, `0`, empty |
| BANKNUM | Bank account number | `1234-5678` |
| EXTRA | Role tag for special accounts | `RETEARNINGS`, `SALESTAX`, `INVENTORYASSET`, `OPENBAL`, or empty |
| HIDDEN | `Y`/`N` inactive flag | |
| DELCOUNT | int | |
| USEID | `Y`/`N` | |

**`EXTRA = RETEARNINGS` identifies the Retained Earnings account** — load-bearing for the reconstruction algorithm (§4). Verified in both real exports.

**ACCNTTYPE codes** (observed in real files + Finance::IIF + community docs — the observed set): `BANK`, `AR` (Accounts Receivable), `AP` (Accounts Payable), `CCARD`, `OCASSET` (Other Current Asset), `FIXASSET`, `OASSET` (Other Asset), `OCLIAB` (Other Current Liability), `LTLIAB` (Long Term Liability), `EQUITY`, `INC` (Income), `EXINC` (Other Income), `EXP` (Expense), `EXEXP` (Other Expense), `COGS`, `NONPOSTING`. MEDIUM confidence on completeness — map unknown codes to a configurable bucket, never crash. (Corroborating list: https://qblittlesquare.com/2011/07/import-lists-into-quickbooks-with-iif/ and https://qbo.support/intuit-interchange-format-iif-files/ — via search extracts.)

### 1.3 !CUST — customers/jobs — HIGH confidence (verbatim)

Modern header (Enterprise 34):

```
!CUST  NAME  REFNUM  TIMESTAMP  BADDR1..BADDR5  SADDR1..SADDR5  PHONE1  PHONE2  FAXNUM  EMAIL  NOTE  CONT1  CONT2  CTYPE  TERMS  TAXABLE  SALESTAXCODE  LIMIT  RESALENUM  REP  TAXITEM  NOTEPAD  SALUTATION  COMPANYNAME  FIRSTNAME  MIDINIT  LASTNAME  CUSTFLD1..CUSTFLD15  JOBDESC  JOBTYPE  JOBSTATUS  JOBSTART  JOBPROJEND  JOBEND  HIDDEN  DELCOUNT  PRICELEVEL
```

Older (QB Mac 6.0) header lacks `EMAIL NOTE SALESTAXCODE JOB* HIDDEN DELCOUNT PRICELEVEL` — **column sets are version-dependent; always parse by the file's own `!` header, never by position.**

Key fields: NAME (colon path for Customer:Job), BADDR1–5/SADDR1–5 (billing/shipping address lines; **city/state/zip may land in one line**), CTYPE (customer type list ref), TERMS (terms name string, e.g. `Net 30`), TAXABLE (`Y`/`N`), TAXITEM (sales-tax item name), LIMIT (credit limit).

Observed data-row pathology (real export): `CUST	"Andres, Cristina"	60	…` — **NAME containing a comma is double-quoted**; `"Fudge, CA 94555"` likewise inside address fields. Fields with apostrophes are NOT quoted (`Adam's Candy Shop`).

### 1.4 !VEND — vendors — HIGH confidence (verbatim)

```
!VEND  NAME  REFNUM  TIMESTAMP  PRINTAS  ADDR1..ADDR5  VTYPE  CONT1  CONT2  PHONE1  PHONE2  FAXNUM  EMAIL  NOTE  TAXID  LIMIT  TERMS  NOTEPAD  SALUTATION  COMPANYNAME  FIRSTNAME  MIDINIT  LASTNAME  CUSTFLD1..CUSTFLD15  1099  HIDDEN  DELCOUNT
```

`PRINTAS` = "print on check as" name; `1099` = `Y`/`N` 1099-eligible; `TAXID` = vendor tax ID. QB Mac 6.0 version omits `EMAIL` and `HIDDEN/DELCOUNT`. Note the literal column name **`1099`** — starts with a digit; don't assume identifier-safe names.

### 1.5 !INVITEM — items — HIGH confidence (verbatim)

Primary (modern) header:

```
!INVITEM  NAME  REFNUM  TIMESTAMP  INVITEMTYPE  DESC  PURCHASEDESC  ACCNT  ASSETACCNT  COGSACCNT  QNTY  VALUE  PRICE  COST  TAXABLE  SALESTAXCODE  PAYMETH  TAXVEND  PREFVEND  REORDERPOINT  EXTRA  CUSTFLD1..CUSTFLD5  DEP_TYPE  ISPASSEDTHRU  HIDDEN  DELCOUNT  USEID  ISNEW  PO_NUM  SERIALNUM  WARRANTY  LOCATION  VENDOR  ASSETDESC  SALEDATE  SALEEXPENSE  NOTES  ASSETNUM  COSTBASIS  ACCUMDEPR  UNRECBASIS  PURCHASEDATE
```

A second, shorter `!INVITEM` header follows in the same file for group/subtotal items: `NAME REFNUM TIMESTAMP INVITEMTYPE DESC TOPRINT EXTRA QNTY CUSTFLD1..5 HIDDEN DELCOUNT USEID`. QB Mac 6.0 primary header ends at `ISPASSEDTHRU` and includes `TAXDIST` (absent in modern).

| Field | Meaning |
|---|---|
| INVITEMTYPE | `SERV`, `INVENTORY`, `NONINVENTORY`(? unverified spelling — observed: `SERV`, `INVENTORY`; community lists also `PART`, `OTHC`, `DISC`, `PMT`, `GRP`, `STAX`, `SUBT` — MEDIUM confidence, map defensively) |
| DESC / PURCHASEDESC | sales / purchase description — **observed containing literal `\n` escape sequences** (two characters, backslash+n) representing line breaks: `Parent Item \nVinyl Irrigation Line` |
| ACCNT | income account (colon path) |
| ASSETACCNT / COGSACCNT | inventory asset / COGS accounts (INVENTORY items) |
| PRICE / COST | sales price / purchase cost |
| TAXABLE | `Y`/`N`; SALESTAXCODE e.g. `Tax`/`Non` |
| PREFVEND | preferred vendor name |

### 1.6 IIF transactions (!TRNS/!SPL) — context only (QBD exports lists via IIF; transaction detail comes from reports)

Verbatim from an Import Kit-derived template (and matching Finance::IIF docs):

```
!TRNS  TRNSID  TRNSTYPE  DATE  ACCNT  NAME  CLASS  AMOUNT  DOCNUM  MEMO  CLEAR  TOPRINT  NAMEISTAXABLE  ADDR1..ADDR5  DUEDATE  TERMS  PAID  PAYMETH  SHIPVIA  SHIPDATE  OTHER1  REP  FOB  PONUM  INVTITLE  INVMEMO  SADDR1..SADDR5  PAYITEM  YEARTODATE  WAGEBASE  EXTRA  TOSEND  ISAJE
!SPL   SPLID   TRNSTYPE  DATE  ACCNT  NAME  CLASS  AMOUNT  DOCNUM  MEMO  CLEAR  QNTY  PRICE  INVITEM  PAYMETH  TAXABLE  VALADJ  REIMBEXP  SERVICEDATE  OTHER2  OTHER3  PAYITEM  YEARTODATE  WAGEBASE  EXTRA
ENDTRNS
```

Block structure: `TRNS` row (first split, usually the source-account side), ≥1 `SPL` rows, `ENDTRNS` terminator. Sign convention: AMOUNT positive = debit, negative = credit; a transaction's TRNS+SPL amounts sum to zero. `ISAJE` = "is adjusting journal entry" (`Y`/`N`). Finance::IIF notes: **QBD imports but does not export `TRNS` via the normal lists path** — full-file IIF exports of transactions exist only via the (accountant) export dialog in some versions; plan around report exports instead (§2).
Sources: https://github.com/0ldMaid/Network-Sales-Monitor/blob/main/iif_build/iff_template.iif (verbatim, derived from Intuit's kit); Finance::IIF POD (above); Import Kit mirror (above).

### 1.7 IIF parsing pathologies — checklist (all observed in real files unless noted)

1. **CSV-style quoting inside a TSV**: any field containing a comma is wrapped in `"…"` (`"15,345.94"`, `"Andres, Cristina"`). Numbers ≥1000 carry thousands separators *inside* the quotes. Strip quotes, then strip commas from numerics. Community reports also quote fields containing tabs/quotes inconsistently — treat a leading `"` as "read to closing quote", but **never let quote scanning cross a line boundary**.
2. **Literal `\n` sequences** (backslash + n, 2 chars) inside DESC/PURCHASEDESC represent embedded newlines. Decide policy: render as newline on output; never treat as a record break.
3. **Repeated/changing `!` headers** for the same keyword (two `!INVITEM` layouts per file).
4. **Version-dependent column sets** (QB Mac 6.0 vs 2006 vs Enterprise 34 differ for ACCNT, CUST, VEND, EMP, TERMS — `!TERMS` columns are entirely different between versions). Parse strictly by header.
5. **Ragged rows**: data rows may have fewer or more cells than the header (trailing-tab padding to a fixed width observed in Import Kit files — dozens of empty trailing cells). Ignore extras, treat missing as empty.
6. Colon (`:`) in NAME = hierarchy separator for accounts, customer:job, and item subitems. A literal colon in a name is indistinguishable — flag ambiguity, don't guess.
7. Amounts may be `0`, `0.00`, `-0.25`, `10.25`, `"1,500.00"` — same column, mixed formats.
8. Windows-1252 high-bytes possible (e.g., `·`, `–`, accented names). The interpunct `·` matters because QBD report columns use `NNNN · Name` account labels (§2).
9. CRLF/LF mixing; possible trailing blank line(s).
10. Old files may include sections your parser doesn't know (`!QBP EMPLOYEE`, `!BUD` with **duplicate column names** — `AMOUNT` ×12 for budget periods, and `!QB ONLINE` whose first data column is confusingly named `ACCNT`). Column-name uniqueness must NOT be assumed.

Parsing pseudocode:

```
decode bytes: if UTF-8 BOM → utf-8; else try strict utf-8; on failure windows-1252
split into lines on /\r\n|\n|\r/
active_headers = {}            // keyword -> [colnames]
for line in lines:
    cells = splitIIFLine(line) // tab-split with CSV-quote awareness per cell:
                               // cell starting with '"' consumes to next '"',
                               // then strip wrapping quotes; unescape "" -> "
    if cells[0] == '' and line is blank: continue
    if cells[0].startsWith('!'):
        kw = cells[0].slice(1)
        active_headers[kw] = cells.slice(1)      // REPLACES prior map for kw
    else:
        kw = cells[0]
        hdr = active_headers[kw]
        if !hdr: record unknownSection(kw); continue
        row = zipLoose(hdr, cells.slice(1))      // ragged-tolerant
        dispatch(kw, row)                        // ACCNT/CUST/VEND/INVITEM/TRNS/SPL/ENDTRNS/...
numeric(v): strip '"', strip ',', parseFloat; ''→null
```

---

## 2. QBD "Custom Transaction Detail Report" export

### 2.1 How the export is produced — HIGH confidence (official, via search extract)

Reports → Custom Reports → Transaction Detail; columns chosen on the Display tab. Export via the report's **Excel ▾** button → "Create New Worksheet" → *Send Report to Excel* dialog → either `.xlsx` or **"Create a comma separated values (.csv) file"**. So the input Ledgerlift must accept is **CSV (comma-delimited) or XLSX** — there is no tab-delimited report export.
Sources: https://quickbooks.intuit.com/learn-support/en-us/help-article/export-reports/export-reports-excel-workbooks-quickbooks-desktop/L4cLJEeXt_US_en_US ; https://quickbooks.intuit.com/learn-support/en-us/reports-and-accounting/custom-transaction-detail-report/00/524101 (both via search extract — pages blocked to this session).

### 2.2 Columns — HIGH confidence for the set below (verbatim header from a real QBD-family export)

Verbatim header row from a real Custom Transaction Detail-style export (Reckon Accounts Desktop = AU-market QuickBooks Desktop codebase; column model identical, some AU label/locale differences noted):

```
Trans #,Type,Date,Num,P. O. #,Name,Source Name,Description,Due Date,Item,Account,Class,Tax Code,Clr,Split,Pay Meth,Qty,Debit,Credit,Amount,Balance,Account Type,Tax Amount
```

US QBD labels for the same report (corroborated by two independent US parsers whose required-column lists are: `Date, Trans #, Type, Num, Name, Memo, Account, Split, Debit, Credit, Amount`): the memo column is **`Memo`** in US builds (Reckon shows `Description`). Full US column palette available on the Display tab includes at least: `Trans #`, `Type`, `Date`, `Num`, `Adj`, `P. O. #`, `Name`, `Source Name`, `Memo`, `Item`, `Account`, `Class`, `Clr`, `Split`, `Qty`, `Debit`, `Credit`, `Amount`, `Balance`, `Account Type`. (MEDIUM confidence on the *complete* palette; HIGH on the core set. Build the mapper header-driven with aliases `Memo|Description`, and per the extraction-service alias list below.)

Sources (verbatim files fetched):
- https://github.com/kanojiyaved/Reckon-Desktop/blob/main/RECKONS%20FILES%20/Credit%20Memo/Reckon%20Desktop%20Adjustment%20Note%20-%20Sheet1.csv (+ sibling files: Bill Credit, Spend Money, Deposit)
- US parser required columns: https://github.com/GorzCode/gl-matching-app/blob/main/README.md and `src/main/parsers.ts` (header may not be row 1 — it scans the first 5 rows for a row containing `Trans #`/`Date`)
- LWN "Escaping QuickBooks" importer (US, Journal report export): https://lwn.net/Articles/729087/ ; code https://github.com/erikmack/qb-escape/blob/master/qb_trans_to_gc
- Header-alias hardening: `['num','ref no','trans #','doc no',…]`, `['account','account name','gl account',…]` from https://github.com/Sage-Vineet/DataHub/blob/main/backend/src/services/keyReports/generalLedgerExtractionService.js

### 2.3 How split lines appear — HIGH confidence (observed in real data)

Every posting line (split) of a transaction is **its own CSV row**; rows of one transaction are consecutive and share the same `Trans #`. Observed structure per transaction:

```
"364,616",Adjustment Note,17/07/2023,168228,…,1224 · Accounts Receivable,…,-SPLIT-,,,,450,-450,…   ← source/target line
"364,616",Adjustment Note,17/07/2023,168228,…,1427 · Sales - National Tiles,…,1224 · Accounts Receivable,,409.09,,409.09,…
"364,616",Adjustment Note,17/07/2023,168228,…,2200 · Tax Payable,…,1224 · Accounts Receivable,,40.91,,40.91,…
```

- The **`Split` column** on each row names the *other side* of that row's posting; when the other side is multiple accounts it shows the literal sentinel **`-SPLIT-`**. The first row of a transaction is the source-account side (its `Split` = `-SPLIT-` or the single counter-account).
- `Account` values are rendered as `` `NNNN · Name` `` when account numbers are enabled (separator is U+00B7 MIDDLE DOT with spaces) — parse with `/^(\d[\d.-]*)\s+·\s+(.*)$/`, else the raw name; sub-accounts appear as `Parent:Child` paths.
- **Debit/Credit columns are both empty on some rows** (zero-amount splits occur — observed). `Amount` = signed value (debit positive, credit negative) relative to the row's account. `Balance` is a running balance — in Excel-roundtripped files it can contain junk (`#REF!` observed); never rely on it.
- The **`Journal` report** variant (same columns, no grouping guarantees) ends each transaction with a **totals row that has BOTH Debit and Credit populated** — qb-escape uses that as the transaction terminator. If you support Journal exports, use the both-populated row as the block terminator and cross-check totals.
- Exports may include **title/date-run preamble rows above the header row** and blank rows between sections — detect the header row by scanning the first ~5 rows for `Trans #`+`Date` (GorzCode approach); some exports also emit a nameless first column (qb-escape drops rows keyed by an empty-string column).

### 2.4 Value formats — HIGH/MEDIUM confidence

- **Dates:** rendered per Windows regional settings — `MM/DD/YYYY` (US), `DD/MM/YYYY` (AU/UK observed), and 2-digit years possible on old systems (qb-escape handles `M/D/YY` with a 1980 pivot). Ledgerlift must ask/detect date order (detect via >12 values, else ask).
- **Negative numbers:** leading minus observed (`-160`, `-23,480.00` as `"-23,480.00"`). Windows regional settings *can* render parentheses `(1,234.56)` — not observed in samples but cheap to support; QBD also has a report preference "In Parentheses". Support both. (Parentheses claim = MEDIUM, defensive.)
- **Thousands separators:** present and quoted (`"23,480.00"`); **even `Trans #` came out quoted with a comma** (`"364,134"`) — treat Trans # as an opaque string key after stripping quotes/commas, not as an int.
- CSV quoting is standard RFC-4180-ish: fields with commas quoted, embedded quotes doubled. CRLF endings observed.
- XLSX exports preserve types better and include the report title rows merged at top; if accepting XLSX, read via SheetJS-style lib and apply the same header-scan.

---

## 3. Trial Balance report export

MEDIUM confidence overall — no verbatim QBD TB CSV artifact could be fetched this session; structure below is from official/community descriptions (via search extract). Handle defensively.

- Run: Reports → Accountant & Taxes → **Trial Balance**, set As-of date range; export via the same Excel▾ → CSV/XLSX path as §2.
- Layout: title preamble rows (company name, "Trial Balance", "As of <date>", accrual/cash basis) — present in Excel export, typically also in CSV; then a two-value-column table: **row label = account (indented per hierarchy in Excel; in CSV the label may keep leading spaces), `Debit`, `Credit`** — "The Trial Balance report only displays the Debit and Credit Column"; balances appear in the natural-balance column, no negatives in the other column (the option to show +/- in one column doesn't exist natively).
- Final row: **`TOTAL`** with sum of Debit and sum of Credit (equal iff books balance).
- Cash vs accrual basis changes numbers — capture the basis from the preamble if present; Ledgerlift's verification must compare accrual TB unless told otherwise.

Sources (all via search extract; pages blocked): https://quickbooks.intuit.com/learn-support/en-us/reports-and-accounting/export-trial-balance-by-class-no-zeros-and-no-subtotals-and/00/701686 ; https://quickbooks.intuit.com/learn-support/en-us/reports-and-accounting/trial-balance-report/00/770274 ; https://www.saasant.com/articles/trial-balance-in-quickbooks/ ; https://quickbooks.intuit.com/learn-support/en-us/help-article/export-reports/export-reports-excel-workbooks-quickbooks-desktop/L4cLJEeXt_US_en_US

**Build rule:** the TB parser should (1) skip until it finds a row whose cells include `Debit` and `Credit`; (2) read `label, debit, credit` rows; (3) stop at a row whose label matches `/^\s*TOTAL/i`; (4) tolerate class-subtotal columns and "No zeros" variants; (5) treat the TB as *verification input only*, never as ledger source.

---

## 4. Reconstruction algorithm (report rows → double-entry ledger → verified per-year statements)

### 4.1 Data model

```
Account   { id, number?, name, path[], type (from IIF ACCNTTYPE or report "Account Type" col),
            parent?, isRetainedEarnings (IIF EXTRA=RETEARNINGS) }
Txn       { transNo (string key), type, date, num?, name?, memo?, splits[] }
Split     { account, debit>=0, credit>=0, amount = debit - credit, memo?, name?, class?, splitLabel }
```

### 4.2 Ingest + grouping

```
rows = parseReportCSV(file)                    // header-scan per §2.3
group rows by transNo (consecutive-run grouping, not global — QBD can reuse
    Trans # across report re-runs; key = (transNo, type, date) tuple, runs only)
for each group:
    if journal-report style and last row has both Debit & Credit → totals row: pop & verify
    splits = rows.map(r => Split{
        account: parseAccountLabel(r.Account),  // "NNNN · Name" | "Parent:Child"
        debit:  num(r.Debit)  ?? 0,
        credit: num(r.Credit) ?? 0 })
```

### 4.3 Per-transaction invariant

```
for each txn: assert |Σdebit − Σcredit| ≤ 0.005          // cent tolerance, decimal math
    on failure → quarantine txn, report; NEVER auto-plug unless user opts into
    a "Reconstruction Imbalance" clearing account (make that account explicit)
```
Use integer cents (or a decimal lib), never IEEE floats, for all sums.

### 4.4 Account rollups

```
build account tree from colon paths (create missing parents as placeholders)
balance(acct, period) = Σ splits in period for acct and all descendants
signed presentation: assets/expenses natural debit; liabilities/equity/income natural credit
classification source of truth: IIF ACCNTTYPE if a lists .IIF was provided,
    else report "Account Type" column, else user mapping UI
```

### 4.5 Per-year trial balance verification

```
for each fiscal year Y in data:
    tb[acct] = Σ splits with date ≤ end(Y)          // TB is cumulative as-of, incl. P&L YTD
    assert Σ tb.debits == Σ tb.credits              // internal consistency
    if user supplied QBD TB export for end(Y):
        align accounts by (number|name|path), compare per-account within tolerance
        classify diffs: missing txns / date-range mismatch / cash-vs-accrual / unmatched accounts
```

### 4.6 Retained-earnings rollover (balance-sheet math)

QBD does **not** post closing entries. Verified behavior (Intuit help + community, via search extract): at fiscal-year end QuickBooks performs an "electronic swap" computed on the fly — income/expense accounts are zeroed for reporting purposes and prior years' cumulative net income is presented inside **Retained Earnings** on any balance sheet dated in a later fiscal year; there is no drillable transaction for it.

Reproduce it virtually:

```
RE_reported(asOf) = RE_posted(asOf)                       // real splits in the RE account
                  + Σ over fiscal years FY fully ended before fiscalYearOf(asOf):
                        netIncome(FY)                     // Σ(income+expense-type splits) in FY
NetIncome_line(asOf) = net income of fiscalYearOf(asOf) up to asOf   // separate equity line
balanceSheet(asOf):  assets = liabilities + equity_other + RE_reported + NetIncome_line
verify: matches QBD Balance Sheet / TB exports, where QBD's TB dated after year-end shows
        RE including prior-year income and no I/E balances from closed years? — NO:
        QBD Trial Balance is cumulative and DOES show I/E accounts with YTD-of-range activity;
        when comparing to a QBD TB use the TB's own date range semantics (columns as exported).
fiscal year start = user setting (QBD Company Info); default Jan 1 but MUST be configurable.
```

Sources: https://quickbooks.intuit.com/learn-support/en-us/help-article/financial-reports/view-retained-earnings-account-details/L7d6Ugx58_US_en_US (via search extract); https://climbtheladder.com/what-is-retained-earnings-in-quickbooks/ ; IIF `EXTRA=RETEARNINGS` tag (verbatim, §1.2) to auto-identify the RE account.

---

## 5. Manager.io batch-create / import

MEDIUM confidence overall: official guide pages were blocked to this session; details below come from search extracts of the official guides plus forum threads. **The one fully reliable, documented workflow is template-driven — mint the column layout at runtime from the user's own Manager business, don't hardcode it.**

Facts (official guide "Use Batch Create and Batch Update functions", https://www2.manager.io/guides/9572, and https://www.manager.io/guides/batch-operations — via search extract):

- Batch Create / Batch Update exist on **functional tabs generally** (chart of accounts, customers, suppliers, inventory items, invoices, receipts/payments, journal entries, …); the buttons appear at the bottom of each tab's listing.
- Mechanics: click **Batch Create** → **Copy to clipboard** copies a **blank template containing only column titles** (clipboard format is spreadsheet-compatible, i.e. **TSV**) → user pastes into a spreadsheet, fills rows, copies *including the heading row*, pastes back into Manager → **Next** shows a parsed preview → **Batch Create** commits.
- Batch Update round-trips existing records the same way and includes a **`Key`** column (the record's UUID). "You cannot add elements using Batch Update because a key is required for every row; keys are generated when elements are added."
- **UUIDs (32-hex GUIDs) appear as foreign keys** in columns referencing accounts, bank accounts, tax codes, custom fields, etc. "Without the correct UUIDs, Manager will ignore entries in batch operations." Build the UUID dictionary by Batch-Update-exporting the referenced tabs first (e.g., chart of accounts) and mapping name→UUID.
- Date and number formats must match the business's preferences; mismatched formats get interpreted as text/ignored.
- Multi-line documents (journal entries with N lines): forum threads confirm it's supported via the same template but the line-item encoding is **not publicly documented in a stable way** (recent Manager versions serialize line items into `Lines`-related columns; older versions used repeated column groups). RED FLAG — do not emit blind. Ledgerlift approach: instruct the user to create ONE manual journal entry with 2+ lines in their Manager business, run Batch Update, paste its clipboard into Ledgerlift; Ledgerlift then mirrors that exact column layout for Batch Create output. This is also what the official guide recommends as the discovery method ("complete one entry … copy the resulting listing from the Batch Update window").
  Forum refs: https://forum.manager.io/t/batch-create-journal-entry/25951 ; https://forum.manager.io/t/how-to-set-lines-account-in-batch-create-journal-entry/36575 ; https://forum.manager.io/t/how-can-i-use-journal-entry-batch-create/36929

Ledgerlift output plan: generate TSV-to-clipboard blobs (`navigator.clipboard.writeText`) per entity, in dependency order: Chart of Accounts → Customers → Suppliers → Inventory/Non-inventory Items → opening balances → Journal Entries (template-mirrored). Provide a name→UUID reconciliation step between each stage.

---

## 6. GnuCash CSV transaction import (multi-split)

HIGH confidence — verified against GnuCash source code and DocBook doc source (both fetched verbatim from the stable branch).

### 6.1 Importable transaction/split fields — verbatim from `gnc-imp-props-tx.cpp` (stable)

Transaction-level: `Transaction ID`, `Date`, `Number`, `Description`, `Notes`, `Transaction Commodity`, `Void Reason`.
Split-level: `Action`, `Account`, `Amount`, `Amount (Negated)`, `Value`, `Value (Negated)`, `Price`, `Memo`, `Reconciled`, `Reconcile Date`, and transfer-side twins `Transfer Action`, `Transfer Account`, `Transfer Amount`, `Transfer Amount (Negated)`, `Transfer Memo`, `Transfer Reconciled`, `Transfer Reconcile Date`.
Source: https://raw.githubusercontent.com/Gnucash/gnucash/stable/gnucash/import-export/csv-imp/gnc-imp-props-tx.cpp (lines 58–82).

These are the column *roles* the import assistant can map; the CSV itself needs no particular header names (mapping is manual/saved-settings), but emitting headers matching the role names makes the user's mapping obvious.

### 6.2 Assistant behavior — verbatim from `C/guide/ch_importing.docbook` (stable)

- File → Import → Import Transactions from CSV. Separators: default comma; space/tab/colon/semicolon/custom combinable. Fixed-width also supported.
- **Multi-split checkbox:** "allows the splits for a single transaction to be defined on consecutive lines within the file with each line defining a single split. If not selected each line is assumed to contain the information for a single transaction including one or two splits."
- In multi-split mode transaction-level fields need only appear on the first line of a transaction; per GnuCash wiki, splits are grouped either by consecutive lines with empty transaction fields or via the **Transaction ID** column; `Account` becomes mandatory per line and Transfer-columns are not used. (Wiki page blocked this session; extract: https://wiki.gnucash.org/wiki/CSV_Import/Export)
- **Encoding** selectable (default UTF-8 for locale). **Date Format selectable and does NOT default to locale** — pick one and state it in the export README (emit ISO `y-m-d`, which the assistant supports as `y-m-d`).
- Leading/trailing lines-to-skip options exist, so a title row is fine; Skip Errors option exists.
- The importer cannot create missing accounts: after column mapping it shows an account-matching page where each `Account Id` string is mapped to a GnuCash account (double-click rows). Ship a matching account tree (GnuCash can import an account hierarchy via its separate "Import Accounts from CSV", or instruct users to pre-create).
- Amounts: `Amount` positive=increase/debit side relative to the split's account; use plain negatives, no thousands separators. (`Amount (Negated)` role exists for bank-style files where outflows are positive.)

Canonical multi-split example (GnuCash manual/wiki):

```
Date,Description,Deposit,Account
05/03/2006,Grocery Store,-45.21,Assets:Checking
,,45.21,Expenses:Groceries
14/03/2006,Employers R Us,670.00,Assets:Checking
,,180.00,Expenses:Taxes:Federal
,,90.00,Expenses:Taxes:Medicare
,,60.00,Expenses:Taxes:Social Security
,,-1000.00,Income:Salary
```

Recommended Ledgerlift emission (one file, all-or-nothing multi-split — mixing modes in one file is not allowed):

```
Transaction ID,Date,Number,Description,Memo,Account,Amount
1,2024-01-05,1001,Invoice 1001 - Acme,AR side,Assets:Accounts Receivable,1500.00
1,2024-01-05,,,revenue,Income:Sales,-1500.00
```
Full account paths colon-separated to match the GnuCash tree; UTF-8; ISO dates; RFC-4180 quoting.

Other sources: manual page (rendered): https://www.gnucash.org/docs/v5/C/gnucash-manual/trans-import.html ; DocBook source fetched: https://raw.githubusercontent.com/Gnucash/gnucash-docs/stable/C/guide/ch_importing.docbook

---

## 7. sql.js / SQLite-in-browser + single-file HTML archive

### 7.1 sql.js — HIGH confidence (README verbatim, fetched)

- sql.js = SQLite compiled to WebAssembly (Emscripten); whole DB lives **in memory**; no persistence — you `db.export()` to a `Uint8Array` (a valid SQLite file) and hand it to the user, and load with `new SQL.Database(uint8array)` (e.g., from `FileReader.readAsArrayBuffer`).
- Needs `sql-wasm.wasm` loaded alongside the JS; `initSqlJs({ locateFile })` points at it. The wasm is ~1.2–1.5 MB (README doesn't state a number; the ~1.5 MB figure is from a 2026 third-party guide — MEDIUM). It can be **inlined as base64** inside a single HTML file (Emscripten single-file builds / manual `wasmBinary` option) at ~1.37× size cost.
- DB size limits: bounded by browser memory, not the library; multi-hundred-MB DBs are workable on desktop; QBD-scale ledgers (10⁴–10⁶ splits) are trivial (tens of MB).
- Alternative: official `sqlite3.wasm` with OPFS persistence (https://sqlite.org/wasm) — relevant only if Ledgerlift wants an autosaving workspace; OPFS is origin-private (not user-visible files) and works in Chrome/Firefox/Safari.
Sources: https://github.com/sql-js/sql.js/ (README fetched verbatim); https://sql.js.org/ ; https://sqlite.org/wasm ; size/limits corroboration: https://recca0120.github.io/en/2026/03/04/sql-js-browser-sqlite/ ; https://powersync.com/blog/sqlite-persistence-on-the-web

### 7.2 Single-file self-contained HTML archive — HIGH confidence (standard techniques)

Pattern: one `.html` containing viewer app (inlined CSS/JS) + data.
- **Data embedding:** `<script type="application/octet-stream" id="db">BASE64…</script>` (or a JS string const). Base64 costs +33%; pre-compress with gzip and decompress at runtime via native `DecompressionStream('gzip')` (Baseline: Chrome 80+, Firefox 113+, Safari 16.4+ — no library needed). JSON-alternative: embed plain JSON if you skip sql.js in the archive; a no-wasm archive (pure JS viewer over JSON) is smaller and CSP-friendlier.
- **Practical size limits:** browsers open multi-hundred-MB local HTML files, but base64-decode + parse must be chunked; keep archives < ~200 MB, warn beyond. `data:` URLs have per-browser caps — don't use data: navigation for the archive itself, only for embedded assets.
- **Saving from the app:** `URL.createObjectURL(new Blob([bytes]))` + `<a download>` works in every 2026 browser. **File System Access API** (`showSaveFilePicker`/`showOpenFilePicker`, in-place re-save): **Chromium-only** — Chrome 86+/Edge 86+/Opera 72+; **Firefox and Safari do not ship the pickers in any 2026 version** (Mozilla marked them harmful; WebKit ships only Origin-Private File System, Safari ≥15.2). Feature-detect (`'showSaveFilePicker' in window`) and fall back to anchor-download.
Sources: https://caniuse.com/native-filesystem-api ; https://developer.mozilla.org/en-US/docs/Web/API/File_System_API ; https://developer.chrome.com/docs/capabilities/web-apis/file-system-access ; https://www.testmuai.com/learning-hub/file-system-access-api-browser-support/ ; wicg spec https://wicg.github.io/file-system-access/
- If the archive embeds sql.js: inline the wasm base64 and pass `wasmBinary` to Emscripten config, avoiding `locateFile`/fetch so it runs from `file://`. CSP note: an archive using `eval`-free sql.js builds runs without relaxing anything; keep all assets inline (no CDN) so it works offline forever.

---

## 8. RED FLAGS (format risks the build must handle defensively)

1. **IIF has no true escaping.** A field containing a real tab or newline is unrepresentable/corrupting; QBD's own exports use CSV-style quotes *only* for commas (+ literal `\n` for line breaks). A malformed row must quarantine the row, not derail the section. (Observed: quotes, `\n`, thousands separators.)
2. **IIF column sets vary by QBD version and can repeat within one file** (two `!INVITEM` layouts; `!BUD` has 12 identical `AMOUNT` columns; `!QB ONLINE`'s first column is named `ACCNT`). Header-driven parsing with positional (not name-keyed) storage is mandatory.
3. **Windows-1252 vs UTF-8**: silent mojibake risk on `·`, accents, `–`. Sniff BOM → strict UTF-8 → 1252 fallback + user override.
4. **Report CSV header row is not row 1**; title preamble, blank separator rows, and a possibly *unnamed* first column occur. Scan first ~5 rows for `Trans #`/`Date` (proven approach).
5. **Locale traps in report exports:** date order (US vs intl), negatives-in-parentheses option, thousands separators inside quoted numerics, and `Trans #` itself arriving as `"364,134"`. Excel round-trips inject worse (`#REF!` in Balance, `Feb-00` where a code like `2-00` was auto-dated — both observed in real files). Balance column: never trust.
6. **`-SPLIT-` sentinel** and `Split`-column semantics differ between report types (Custom Transaction Detail vs Journal, which needs totals-row termination). Zero-amount splits exist (both Debit and Credit empty) — keep them, they carry memos.
7. **Trans # is not globally unique** across report re-runs/files; group by consecutive runs keyed on (Trans #, Type, Date).
8. **Trial Balance export layout unverified verbatim** this session (MEDIUM confidence): code the TB parser tolerant (find Debit/Credit header, stop at TOTAL, ignore indentation) and unit-test against user-supplied files early.
9. **Retained earnings is virtual** in QBD — no closing entries exist in transaction data. Any per-year balance-sheet check must synthesize the rollover (§4.6) and respect a configurable fiscal-year start; cash-basis exports will not tie to accrual reconstruction.
10. **Manager.io line-item batch encoding is undocumented/unstable** across versions; UUID foreign keys mean name-based emission silently no-ops ("Manager will ignore entries"). Ship the template-mirroring workflow (§5), never a hardcoded journal-entry layout.
11. **GnuCash import cannot create accounts** and multi-split cannot be mixed with single-line format in one file; date format must be explicitly chosen in the assistant. Emit ISO dates + a step-by-step import README with the exact assistant settings.
12. **File System Access API is Chromium-only in 2026** — the "save in place" UX must degrade to anchor-download on Firefox/Safari; OPFS is not user-visible storage, so "your data never leaves the browser" messaging must explain export-to-file explicitly.
13. **Official Intuit IIF/report docs are login-/bot-walled** (403s even to normal fetchers this session) and the IIF Import Kit is distributed as a download; keep local golden-file fixtures (the GitHub-mirrored kit + real exports cited above) in the test suite rather than linking docs at runtime.

---

## Source index (per section)

- §1 IIF: real exports — github.com/Pewejekubam/qbd-to-gnucash (`input/qbd-all-lists-sample.IIF`), github.com/gitpan/Finance-IIF (`t/sample.iif`, `lib/Finance/IIF.pm`), github.com/0ldMaid/Network-Sales-Monitor (`iif_build/iff_template.iif`), github.com/overhacked/square-bridge (IIF Import Kit mirror), github.com/MessiDaGod/chris_stuart (`Export.IIF`, Enterprise 29); official landing (search extract): quickbooks.intuit.com …/iif-overview-import-kit-sample-files-headers/L5CZIpJne_US_en_US; community: qbo.support/intuit-interchange-format-iif-files/, qblittlesquare.com/2011/07/import-lists-into-quickbooks-with-iif/
- §2 Transaction detail: github.com/kanojiyaved/Reckon-Desktop (4 real report CSVs), github.com/GorzCode/gl-matching-app (README, parsers.ts), github.com/erikmack/qb-escape + lwn.net/Articles/729087/, github.com/Sage-Vineet/DataHub (header aliases); Intuit export how-to (search extract): …/export-reports-excel-workbooks-quickbooks-desktop/L4cLJEeXt_US_en_US
- §3 Trial balance: Intuit community threads 701686, 770274 (search extracts); saasant.com/articles/trial-balance-in-quickbooks/
- §4 Algorithm: §1/§2 artifacts + Intuit RE article L7d6Ugx58 (search extract), climbtheladder.com/what-is-retained-earnings-in-quickbooks/
- §5 Manager.io: www2.manager.io/guides/9572, www.manager.io/guides/batch-operations (search extracts); forum.manager.io threads 25951, 36575, 36929, 23371
- §6 GnuCash: raw source gnucash/import-export/csv-imp/gnc-imp-props-tx.cpp (stable), gnucash-docs C/guide/ch_importing.docbook (stable), gnucash.org/docs/v5/C/gnucash-manual/trans-import.html, wiki.gnucash.org/wiki/CSV_Import/Export (extract)
- §7 Browser: github.com/sql-js/sql.js README, sql.js.org, sqlite.org/wasm, caniuse.com/native-filesystem-api, MDN File System API, developer.chrome.com FSA guide, powersync.com/blog/sqlite-persistence-on-the-web
