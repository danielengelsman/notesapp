# Completeness Audit — pre-packaging gap list

Auditor: completeness-critic agent · 2026-07-11 · repo `/home/user/notesapp`, branch `claude/startup-from-scratch-sdbrut`
Method: full repo + git-log sweep, test/build/serve execution, video decode, grep for old names, secret scan, citation spot-check.

## What verifiably works today

- `npm test`: **26/26 pass** (engine 19, exporters 7).
- `npm run build` (`next build --webpack`, static export): succeeds; 7 routes prerendered.
- `npx serve out`: serves; `/`, `/app/`, `/pricing/` return 200; title "Bookstead — Your books, yours again."
- Videos: `deliverables/videos/bookstead-launch.mp4` (72.3 s) and `bookstead-founder.mp4` (77.5 s), both h264+aac, both fully decode with zero ffmpeg errors — playable in any browser.
- Built output is self-contained: no external URLs in `out/index.html` (no CDN fonts/analytics).
- Intuit trademark disclaimer present in site footer (`src/app/layout.tsx`).
- Research files are densely cited (16–51 http-citation lines per file); `painhunt.json` (98 KB) and `tournament.json` (114 KB) present as evidence of the multi-agent phases.
- Git is clean except one modified file (see I-2). No untracked junk. Old SecureNotes app code is fully gone from `src/`, `public/`, routes.

---

## BLOCKER (definition-of-done fails without these)

### B-1 · README.md is still create-next-app boilerplate
`/home/user/notesapp/README.md` never mentions Bookstead, tests, the static export, the demo license, or `deliverables/`. It even points to `app/page.tsx` (wrong path — code is under `src/app/`). A stranger cloning this repo has no entry point. Must state, minimum:
```
node >= 20.9 (built on v22.22.2)
npm ci
npm test          # 26 tests
npm run build     # static export to out/
npx serve out     # open http://localhost:3000
```
plus: how to demo (`/app/` → load sample company → paste key from `deliverables/DEMO_LICENSE.txt`), and a pointer to `deliverables/` and the recap.

### B-2 · Recap HTML does not exist (Phase 8 pending — this is its spec)
Nothing in the repo satisfies "a stranger can open the recap HTML." To meet the definition of done it MUST contain, self-contained (no external assets, works from `file://` or the static server):
1. The business in one screen: problem, product, buyer, price, why now.
2. The full arc as told: pain hunt (53 candidates, 12 researchers) → adversarial verification (5/8 refuted) → tournament (scores: Ledgerlift 287 / Roundtrip 280 / …) → **the rename to Bookstead and why** → build → videos → kill attempt → package.
3. Both videos embedded/playable via **relative paths** to `deliverables/videos/*.mp4`.
4. Exact run + demo instructions (same as B-1), including the demo license key.
5. Links to every deliverable: BUSINESS_PLAN.md, BRAND.md, DECISIONS.md, all 7 research files, painhunt.json, tournament.json, this audit.
6. The proof story: 26 tests, penny-perfect reconciliation on the 1,369-txn/6-yr Blue Heron fixture, sabotage-detection test — and how to re-run it.
7. Kill-attempt results (see B-3) and honest open risks.
8. "Facts verified as of <date>" stamp (see I-5).

### B-3 · "Try to kill it" phase has no artifact
The mission arc includes an adversarial kill attempt before packaging. There is no red-team deliverable, no D-entry, no document anywhere attacking the finished business/product (e.g. security review of the license scheme, refund/support economics stress, "Intuit adds free deep-history export" scenario, CSP claim check — which would have caught B-4). Either it hasn't run or it wasn't written down; both violate "every decision written down."

### B-4 · The plan claims a CSP that does not exist in the product
`deliverables/BUSINESS_PLAN.md` ("CSP `connect-src 'none'` — the no-upload claim is **browser-enforced**, not promised") and DECISIONS D-010 legal notes assert this as architecturally true. **Grep of `src/` and `out/` finds no Content-Security-Policy anywhere** — no meta tag, no headers (static export can't send headers). The security page (`src/app/security/page.tsx`) is more careful (tells users to check the Network tab), but the flagship written claim is currently invented, which violates "nothing invented" and is exactly what FTC-risk research warned about. Fix: add `<meta http-equiv="Content-Security-Policy">` on the `/app` route (test carefully — Next client navigation fetches RSC payloads, so `connect-src 'none'` may need `'self'` or scoping to the app page), or reword the claim everywhere to match reality.

---

## IMPORTANT (a demanding evaluator flags these)

### I-1 · Decision log stops at D-010 — Phases 4–7 undocumented
`deliverables/DECISIONS.md` ends mid-arc ("log continues as phases complete"). Missing entries for work that git log proves happened: exporter scope as shipped (GnuCash multi-split / Manager.io / generic CSV), the Ed25519 licensing + verify-before-pay gating design and the decision to commit a demo key, website IA/pages, brand-book choices, pricing bump to $599/10 files (mentioned in D-010 but market file still says $499 — see I-6), GTM plan adoption, and the executed video decisions (final scene list, use of real product footage for launch scenes 4–5, final VO script). The name change (D-009) and video *pipeline* (D-003/D-005) ARE logged.

### I-2 · Uncommitted change in the working tree
`deliverables/BUSINESS_PLAN.md` is modified but not committed (product-status wording update). Commit before packaging; the recap must describe a committed state.

### I-3 · Private signing key is committed
`scripts/license-signing-key.json` contains the Ed25519 **private** key and its own note says "PRODUCTION: keep only in the checkout webhook env." Committing it is defensible for a local demo (it's what makes `DEMO_LICENSE.txt` reproducible), but it is undocumented. Acknowledge it explicitly (README + a D-entry: "demo keypair, intentionally committed, rotate before any real checkout"), or a reviewer will read it as a leak. (`DEMO_LICENSE.txt` itself is fine/intentional.)

### I-4 · Seven research files still speak as "Ledgerlift"
All of `deliverables/research/research-{market,competition,legal,pricing,techspec,naming,gtm}.md` are titled/worded for the abandoned name (they predate D-009). Don't rewrite history — add a one-line banner to each: "Written pre-rename; 'Ledgerlift' = Bookstead (see DECISIONS.md D-009)." Old-name remnants elsewhere are intentional narrative (DECISIONS.md, BRAND.md history note, founder-video scene F5) — leave those. No `securenotes` remnants outside the decision log; root README has none but is boilerplate (B-1).

### I-5 · Citations cannot be re-verified from this sandbox — stamp the verification date
Spot-check of 5 source URLs (paddle.com/pricing, movemybooks.co.uk/pricing, quickbooks.intuit.com/dataswitcher, sdocpa.com, sqlite.org/wasm) failed with proxy **403 CONNECT denials** — the sandbox's network policy now blocks general web egress, for curl and WebFetch alike. Citations are present and specific throughout the research files, but nobody (including the packaging phase) can re-check them from here. Add "verified as of 2026-07-11 (or actual fetch date)" to each research file header and the recap, so the stranger knows the facts' freshness and why they were not re-verified at package time.

### I-6 · Internal price inconsistency
DECISIONS D-010 adopts Bookkeeper pack at **$599/10 files** (and BUSINESS_PLAN.md agrees), but `research-market.md` §5 still models "$499/10-file tier." Add a reconciling note rather than editing the research.

### I-7 · No Node version pinned; `serve` not a dependency
No `engines` field, no `.nvmrc` (Next 16 requires Node ≥ 20.9; built on v22.22.2). `npm start` runs `npx serve out`, which downloads `serve` on first use — fine online, surprising offline. Pin Node in `package.json#engines` + `.nvmrc`, and either add `serve` to devDependencies or document the download.

---

## NICE (polish)

### N-1 · Lint is red
`npm run lint`: 4 errors, 1 warning — `prefer-const` ×3 (`src/engine/iif.ts:41`, `src/engine/txnreport.ts:38` ×2), `no-require-imports` (`scripts/generate-fixtures.ts:370`), unused `isBalanceSheet` (`src/engine/archive.ts:8`). All one-liners.

### N-2 · Launch scene numbering gap (L4/L5 missing from scenes/)
`deliverables/videos/scenes/` has L1–L3, L6. Presumably L4/L5 were real product screen recordings, but nothing says so. One README line in `scenes/` (or a note in `voiceover-script.json`) prevents a reviewer thinking files were lost.

### N-3 · No repository LICENSE file
The business sells "software you can own"; the repo itself declares no license/copyright. Add one (even "proprietary, all rights reserved — demo repo") for completeness.

### N-4 · D-001 references a file that no longer exists
`.env.local.example` was removed with the SecureNotes app; D-001 still cites it as present. Harmless, but a footnote ("since deleted with the old scaffold") keeps the log honest.

### N-5 · Videos aren't reachable from the product/site
Nothing on the site or in the app links the launch video. Fine if the recap is the hub — just make sure it is (B-2 item 3).

### N-6 · Demo-license discoverability
`DEMO_LICENSE.txt` sits in `deliverables/` with no pointer from the app's unlock UI or README. Stranger demoing Pro features won't find it. (Folded into B-1/B-2 instructions.)

### N-7 · `out/` is gitignored (correct), but that means a stranger must build before `npx serve out` works
The one-liner in B-1 covers it; just don't let the recap say "run `npm start`" without "build first."

---

## Tally

| Priority | Count |
|---|---|
| BLOCKER | 4 |
| IMPORTANT | 7 |
| NICE | 7 |
