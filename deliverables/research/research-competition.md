> **Historical note:** this dossier was researched under the working name "Ledgerlift", later renamed **Bookstead** (see DECISIONS.md D-009). Facts verified as of July 11, 2026; the build sandbox blocks live re-fetching, so verify time-sensitive figures before external use.

# Ledgerlift — Competitive Teardown (QBD evacuation / archive / conversion market)

Research date: 2026-07-11. Method: live web search + GitHub API. NOTE: the sandbox egress proxy blocked direct page fetches to most competitor domains (HTTP 403 CONNECT denial), so several facts are sourced from search-result snippets of the named pages rather than full page fetches. Anything not directly confirmed is marked UNVERIFIED.

---

## 1. Teardown table

| Competitor | What it is | Price | History depth | Destinations | Upload required? | Turnaround | Regions |
|---|---|---|---|---|---|---|---|
| Intuit built-in QBD→QBO migration tool | Free in-product migration | Free | Full file, but hard fail >750k targets | QBO only | Yes (to Intuit) | Hours–days | US/CA/UK etc. |
| Dataswitcher (Intuit-embedded) | Server-side conversion wizard | Free for last 2 yrs (Intuit pays); fee per extra fiscal year (amount only shown in-tool) | 2 yrs free, more paid | QBO only (as embedded by Intuit) | Yes — upload QBW/QBM/QBB to Dataswitcher | 2–4 business days | US, CA, UK+ |
| MoveMyBooks | Server-side conversion service | Free standard (subsidized by Xero/Intuit/Sage); £75/extra yr ex VAT; assisted £245+VAT | Current YTD + 1 prior yr free | Xero, QBO | Yes | Days (UNVERIFIED exact) | UK & Ireland |
| E-Tech / QuickBooksRepairPro | Done-for-you conversion & file repair | Repair: US$275 std / US$449 expedited. Enterprise→Pro/Premier: $299 / $449 | Whole file | QB-family formats, QBO↔QBD, Sage→QB etc. | Yes — send them the file | Repair 48h / 12–24h; Ent→Pro 3–6h | US/CA |
| WOW BookSwitch | Done-for-you QBD→Xero | US$399 flat; +$100/extra yr | 3 yrs + current FY | Xero | Yes | UNVERIFIED | US-focused |
| MMC Convert | Offshore done-for-you migration | Not public (quote) | Varies | Xero, QBO, FreshBooks, FreeAgent | Yes | Days | Global |
| Wave (QBD→Wave) | Official path is now manual | Free | ZERO history — opening balances via manual TB journal entry | Wave | n/a | n/a | US/CA |
| toqbo.com | In-browser bank-file converter | Freemium (UNVERIFIED pricing) | Bank transactions only, NOT company history | QBO/IIF/CSV | NO — runs in browser | Instant | Any |
| ProperConvert (ProperSoft) | Local desktop transaction-file converter | Paid desktop app (price UNVERIFIED) | Bank/transaction files only | QBO/IIF/QIF/CSV etc. | NO — local app | Instant | Any |
| Open-source (qb-escape et al.) | DIY scripts | Free | Full journal, if you hand-export | GnuCash only | No — local, but needs working QBD to export | Hours of manual work | Any |
| Status quo (old laptop) | Keep QBD running read-only | $0 marginal | Everything | None | No | n/a | Any |

---

## 2. Detailed profiles

### 2.1 Intuit's own QBD→QBO migration tool
- Free, built into QBD ("Export company file to QuickBooks Online") plus an Accountant Batch Migration Tool [https://quickbooks.intuit.com/learn-support/en-us/help-article/import-export-data-files/move-quickbooks-desktop-file-quickbooks-online/L6af3Z0Fb_US_en_US] [https://quickbooks.intuit.com/learn-support/en-us/help-article/migrate-services/move-files-quickbooks-online-accountant-batch-tool/L4iyuxCPp_US_en_US]
- Hard size limits: files over 750,000 "targets" can't be converted to QBO — options are condense the file, import only lists & balances, or start fresh; files above 750k may still migrate to QBO Advanced up to a 4,000,000-target ceiling but with documented data-discrepancy risk (esp. inventory) and long migration times [https://quickbooks.intuit.com/learn-support/en-us/other-questions/quickbooks-online-target-limit/00/1336776] [https://quickbooks.intuit.com/learn-support/en-us/help-article/migrate-services/fix-errors-converting-quickbooks-desktop-online/L1fF2hcwF_US_en_US]
- What it drops: past reconciliation reports, memorized reports, budgets, custom templates, and the entire historical audit trail do not convert [https://www.hawkinsash.cpa/what-data-does-or-does-not-convert-from-quickbooks-desktop-to-quickbooks-online/]
- User complaints: "transition from quickbooks desktop to online - nightmare" thread; missing names in transaction detail behind P&L lines after migration; memorized-report loss met with "engineers won't address unless there's enough votes" [https://quickbooks.intuit.com/learn-support/en-us/account-management/transition-from-quickbooks-desktop-to-online-nightmare/00/1408800] [https://quickbooks.intuit.com/learn-support/en-us/reports-and-accounting/report-issue-when-migrating-from-qb-desktop-to-qb-online/00/1240985]
- Advisors explicitly recommend saving PDF copies of reconciliation reports and the audit trail before migrating — i.e., the archive job is unmet even inside Intuit's own funnel [https://www.hawkinsash.cpa/what-data-does-or-does-not-convert-from-quickbooks-desktop-to-quickbooks-online/]

### 2.2 Dataswitcher (embedded in Intuit's migration; formerly powered Wave's importer)
- Intuit covers the cost of the last 2 years of data when migrating QBD→QBO via Dataswitcher: "Up to two years of opening balances, customers & suppliers, Chart of Accounts, invoices, transactional histories, and journal entries" free; additional fiscal years cost extra, per year — the fee amount is only disclosed inside the tool [https://quickbooks.intuit.com/learn-support/en-ca/help-article/accounting-bookkeeping/converting-quickbooks-desktop-data-quickbooks/L0nrPxrJK_CA_en_CA] [https://quickbooks.intuit.com/dataswitcher/]
- Extras (classes, company info, more years) carry "small fees" [https://quickbooks.intuit.com/learn-support/en-ca/help-article/accounting-bookkeeping/converting-quickbooks-desktop-data-quickbooks/L0nrPxrJK_CA_en_CA]
- Documented QBD limitations — does NOT convert: budgets, memorized transactions, invoice/other templates, sales orders, payroll records, projects, attachments, non-posting entries (estimates) [https://support.dataswitcher.com/support/solutions/articles/43000648882-conversion-limitations-quickbooks-desktop-qbdt- — seen via search snippet; page blocked to direct fetch]
- Upload is mandatory: "Upload with Dataswitcher… upload your data file", accepts QBW/QBM/QBB, then email progress updates; conversion completes in 2–4 business days; target QBO company must be empty [https://quickbooks.intuit.com/learn-support/en-uk/help-article/migrate-services/comprehensive-guide-dataswitcher/L22WWA0As_GB_en_GB]
- Wave: Wave's current official "Switch to Wave from Quickbooks" help article carries over NO transaction history — you re-key opening balances as a journal entry from your QuickBooks trial balance [https://support.waveapps.com/hc/en-us/articles/32526944035092-Switch-to-Wave-from-Quickbooks]. Any prior Dataswitcher-powered Wave importer appears gone (UNVERIFIED whether formally discontinued).

### 2.3 MoveMyBooks
- Regions: UK and Ireland (movemybooks.co.uk / movemybooks.ie) [https://movemybooks.co.uk/pricing/] [https://movemybooks.ie/migrate-to-quickbooks-online-for-free/]
- Sources: Sage 50, Sage Accounting, QuickBooks Desktop, QuickBooks Online, KashFlow, FreeAgent. Destinations: Xero and QBO. Xero lists it as its supported converter; it is "the only supported method of conversion to QuickBooks Online" in the UK [https://movemybooks.co.uk/move-to-xero/] [https://apps.xero.com/uk/app/movemybooks]
- Pricing: standard conversion (current accounting year to date + all of previous year) is FREE because Xero/Sage/Intuit subsidize it; £75 + VAT per additional year; assisted (done-for-you) conversion £245 + VAT [https://movemybooks.co.uk/pricing/]
- Reconciliation proof: none built-in pre-payment — their own KB tells the USER to generate a Trial Balance and compare Debtors/Creditors control balances to aged reports after conversion [https://movemybooks.com/kb/troubleshooting/] [https://movemybooks.com/kb/post-conversion-xero/]
- Reputation: mixed; ~115 Trustpilot reviews, and an Intuit community thread literally titled "Movemybooks is useless" [https://www.trustpilot.com/review/movemybooks.co.uk] [https://quickbooks.intuit.com/learn-support/en-uk/other-questions/movemybooks-is-useless/00/1229477]

### 2.4 E-Tech (e-tech.ca; brands: quickbooksrepairpro.com, quickbooksfilerepair.com, qbrecovery.com)
- QuickBooks file repair/data recovery: flat US$275 standard (48-hour turnaround), US$449 expedited (12–24 hours); no diagnosis fee; no-data-no-charge guarantee [https://quickbooksfilerepair.com/ — via search snippet]
- Enterprise→Pro/Premier downgrade conversion: $299 regular / $449 expedited, 3–6 hour turnaround, money-back guarantee [https://quickbooksrepairpro.com/quickbooks-enterprise-to-pro-or-premier-conversion.aspx — via search snippet]
- QBO→Desktop conversion: 2 business days, longer with inventory [https://qbrecovery.com/Quickbooks-Online-to-Desktop-Conversion.aspx]
- Model: you SEND THEM your company file (books leave your control); services span migrations from NetSuite, Sage 50, MYOB, SAP, etc. into QB [https://e-tech.ca/]
- Adjacent player found on GitHub: "QB Conversion Pro" advertising $50/file QBW/QBA/QBB/QBO conversions via a GitHub Pages site — looks low-trust/gray-market [https://github.com/qbconversionpro/qbconversionpro.github.io]

### 2.5 Other done-for-you converters
- WOW BookSwitch: QBD→Xero flat US$399 covering 3 years + current fiscal year; +US$100 per extra year [https://wowbookswitch.com/ — via search snippet]
- MMC Convert: migrates historical data to Xero, QBO, FreshBooks, FreeAgent; pricing not published (quote-based); add-ons extra [https://www.mmcconvert.com/] [https://www.capterra.com/p/212083/MMC-Convert/]
- Xero offers free QuickBooks→Xero conversion in the US via its conversion partners [https://www.xero.com/us/accounting-software/convert-from-quickbooks/]

### 2.6 The status quo: keep an old laptop running QBD
- Intuit stopped selling QuickBooks Desktop (Pro/Premier/Mac Plus) to NEW US subscribers on September 30, 2024; Enterprise remains sold and supported with no published end date [https://quickbooks.intuit.com/r/whats-new/quickbooks-desktop-stop-sell/] [https://www.sdocpa.com/quickbooks-desktop-discontinued/]
- Sunset cadence: each version loses services ~3 years in, on May 31 — QBD 2023 sunset May 31, 2026 (payroll, bank feeds, security updates, connected services die) [https://blog.insightfulaccountant.com/quickbooks-2023-desktop-products-sunset-5/31]; QBD 2024 (last non-Enterprise version) discontinues May 31, 2027 per most sources — one source says Sept 30, 2027 (CONFLICTING; the May 31, 2027 date matches Intuit's historical pattern) [https://www.sdocpa.com/quickbooks-desktop-discontinued/] [https://wizcommerce.com/blog/how-long-will-quickbooks-desktop-be-supported-discontinuation/]
- Subscription lapse: when a QBD Plus subscription ends, the product drops to VIEW-ONLY mode for 1 year — reports only, no new transactions, admin user only, breaks in multi-user mode and on Rightworks hosting; after 1 year you must renew to see your own data [https://quickbooks.intuit.com/learn-support/en-us/help-article/cancel-products-services/renew-subscription-use-view-mode-quickbooks-2023/L4IUEYTMg_US_en_US]
- Reactivation policy for discontinued perpetual versions: discontinued products CAN be re-registered only if previously registered and being reinstalled; they CANNOT be registered for the first time; automated activation is a "brick wall" — users must phone Intuit during business hours to beg for a validation code, and assisted support for discontinued products is officially ended [https://quickbooks.intuit.com/learn-support/en-us/install/register-or-activate-quickbooks-desktop/00/254456 — via search snippet] [https://quickbooks.intuit.com/learn-support/en-us/help-article/register-activate-services/fix-activation-license-product-numbers-errors/L2iGNZZQr_US_en_US]
- Net: the "old laptop" strategy dies with the hardware — a disk failure or new PC can strand a perpetual license that can no longer be self-activated. This is Ledgerlift's strongest fear-based wedge, and it is real and verifiable.

### 2.7 Open-source / GitHub landscape (QBD extraction & IIF parsing)
- No public reverse-engineering of the QBW container exists. QBW is an encrypted Sybase SQL Anywhere database with hashed credentials and a proprietary clustered-table layout; the .TLG is the Sybase transaction log [https://www.thegrideon.com/qb-internals-sql.html] [https://insightfulaccountant.com/accounting-tech/general-ledger/the-mysterious-qbw-tlg-file/] [https://datisfy.com/the-truth-about-quickbooks-desktop-files/]. Thegrideon sells a commercial "QuickBooks Forensics" tool for data access/password recovery [https://www.thegrideon.com/quickbooks-forensics.html]
- qb-escape (erikmack/qb-escape): the canonical open-source QBD→GnuCash escape route, from Jonathan Corbet's 2017 LWN article "Escape from QuickBooks (with data in hand)" [https://lwn.net/Articles/729087/]. 45 stars, 7 forks, Python, GnuCash-only, last touched 2026-05 [https://github.com/erikmack/qb-escape]. Its README (fetched) shows the workflow: manually export Lists to IIF (accounts/customers/vendors only), manually run the Journal report for all time, export to Excel, hand-clean the CSV (dedupe account names, strip slashes, fix number formats, watch for 256-row truncation), then import via GnuCash Python bindings. Explicit disclaimer: "look closely before you trust what these scripts produce" [https://raw.githubusercontent.com/erikmack/qb-escape/master/README.md]. Loses reconciliation status; no invoices/inventory/payroll detail — pure GL journal.
- IIF parsers: minimul/iif-parser (Ruby, 10 stars) [https://github.com/minimul/iif-parser]; ruby-building-blocks/ruby-iif (1 star) [https://github.com/ruby-building-blocks/ruby-iif]; DevTareq/Parz (PHP, 1 star) [https://github.com/DevTareq/Parz]. All small, list-level, mostly dormant.
- qbXML tooling targets the live QBD SDK/Web Connector, not files: qbwc/qbxml (Ruby, 31 stars) [https://github.com/qbwc/qbxml]. Useless without a running Windows QBD instance.
- Misc one-way utilities: CSV→IIF scripts (ddehghan/python-QuickBooks, 19 stars) [https://github.com/ddehghan/python-QuickBooks]; IIF→QIF/CSV (briandw/quickbooks_iif_conversion, 0 stars) [https://github.com/briandw/quickbooks_iif_conversion]; GnuCashToQIF/IIF [https://gnucashtoqif.us/]. An embryonic "Open Accounting Interchange Format" repo exists but is a spec stub [https://github.com/GitHubNewbie0/oaif-open-accounting-format]
- Verdict: nothing on GitHub is productized, nothing parses QBW/QBB, nothing produces an archive, and everything requires a working QBD install to do the exports. Maturity: hobbyist.

### 2.8 Does anything already do "client-side, never uploads"?
- toqbo.com: "Everything runs in your browser… your sensitive financial data never leaves your computer" — but it converts bank-statement-level files (CSV/PDF/QBO/IIF) for import INTO QuickBooks, not company-file history OUT [https://toqbo.com/]
- ProperConvert (ProperSoft): local desktop app, "data stays on your machine and is never uploaded" — again transaction/bank files only [https://www.propersoft.net/]
- convert.guru advertises a ".QBW Converter" [https://convert.guru/qbw-converter] — UNVERIFIED what it actually does (page blocked to fetch; likely an upload/manual service). No evidence of true client-side QBW parsing.
- Conclusion: NO existing product does client-side, no-upload conversion or archiving of full QBD company history. The privacy positioning is genuinely unoccupied — but see Red Flag #1 on why.

### 2.9 Destination import reality (matters for the "import pack" promise)
- Manager.io: "no specific interface to import from QuickBooks or any other software package" — migration is closing-balance entry or Batch Create paste of pre-staged data [https://forum.manager.io/t/importing-quickbooks-data/35354] [https://forum.manager.io/t/import-from-quickbooks/3993]. A well-formed Batch Create pack is a real differentiator; also a support burden.
- GnuCash: imports QIF/CSV; the community's documented QBD path is IIF→QIF hacks and qb-escape [https://gnucash-user.gnucash.narkive.com/tvAz4Hrx/quickbooks-iif-file-conversion-to-qif-for-gnucash-import] [https://lwn.net/Articles/729087/]
- Wave: no history import at all (opening balances only) [https://support.waveapps.com/hc/en-us/articles/32526944035092-Switch-to-Wave-from-Quickbooks]

---

## 3. Honest competitive gaps (where Ledgerlift wins / loses)

WINS (verified gaps no one fills):
1. Permanent offline archive as a product. Everyone else converts forward; nobody sells "your history, readable forever, no QuickBooks required." Even Intuit's ecosystem tells users to print PDFs of reconciliation reports and audit trail before migrating [https://www.hawkinsash.cpa/what-data-does-or-does-not-convert-from-quickbooks-desktop-to-quickbooks-online/]
2. No-upload privacy. Every real converter (Dataswitcher, MoveMyBooks, E-Tech, MMC) requires surrendering the company file to a third party or Intuit [see 2.2–2.5]. Client-side full-file conversion does not exist today [see 2.8].
3. Full-depth history at flat price. Dataswitcher/MoveMyBooks meter by year (£75/yr, fee/yr); a 15-year-old file gets expensive or gets truncated to 2 years. $149 flat for all years is a clean counter-position [see 2.2, 2.3].
4. Trial-balance proof BEFORE payment. MoveMyBooks makes the user check the TB themselves afterward [https://movemybooks.com/kb/troubleshooting/]; services offer money-back guarantees, not pre-purchase proof. A reconcile-then-pay flow is novel in this market.
5. Cheap/free destinations. Xero/QBO conversions are vendor-subsidized; nobody subsidizes escape to Manager.io/GnuCash/CSV because no vendor profits. That's structurally why the niche is empty and why it can stay Ledgerlift's.

LOSSES / where competitors are strong:
- Going QBD→QBO: Intuit + Dataswitcher are FREE for the common case (≤2 yrs history, <750k targets). Ledgerlift shouldn't compete for cloud-QBO switchers.
- Done-for-you: E-Tech-style shops take a corrupt or weird file and hand back a working one for $275–$449 with a human on the hook [see 2.4]. A self-serve tool can't fix corruption.
- UK/IE: MoveMyBooks standard conversion is free to the user [https://movemybooks.co.uk/pricing/].

---

## RED FLAGS

1. THE QBW PARSING PROBLEM (existential). QBW/QBB are encrypted, undocumented Sybase SQL Anywhere databases [https://www.thegrideon.com/qb-internals-sql.html] [https://datisfy.com/the-truth-about-quickbooks-desktop-files/]. No open-source parser exists (verified via GitHub search, 2.7). A "100% client-side, drop your .QBW in the browser" product implies either (a) heroic in-browser reverse-engineering of an encrypted proprietary format — high effort, legally aggressive, breaks per-version — or (b) requiring users to run manual exports (Lists→IIF + Journal report→Excel/CSV) from a WORKING QuickBooks install, which is exactly qb-escape's fragile, hand-editing-prone workflow [https://raw.githubusercontent.com/erikmack/qb-escape/master/README.md]. The pitch and the technically feasible product may not be the same product. This must be resolved before anything else.
2. Export-path dependency contradicts the rescue narrative. The users most in need (dead laptop, lapsed subscription past the 1-year view-only window, unactivatable license) CANNOT run the exports because they can't open QuickBooks at all [https://quickbooks.intuit.com/learn-support/en-us/help-article/cancel-products-services/renew-subscription-use-view-mode-quickbooks-2023/L4IUEYTMg_US_en_US]. Ledgerlift works best for people who still have working QBD — marketing must push "evacuate NOW while it still opens," not "we rescue dead files."
3. Exports are lossy. IIF list export + Journal report drops reconciliation status, audit trail, attachments, payroll detail, memorized transactions, open-invoice linkage, and inventory structure — the same things Dataswitcher and Intuit drop [https://support.dataswitcher.com/support/solutions/articles/43000648882-conversion-limitations-quickbooks-desktop-qbdt-] [https://www.hawkinsash.cpa/what-data-does-or-does-not-convert-from-quickbooks-desktop-to-quickbooks-online/]. The "PROVES completeness" claim can honestly cover the general ledger / trial balance, not the whole file. Overclaiming completeness invites refunds and reputational damage from accountants.
4. Free-competitor gravity. For the largest migration cohort (QBD→QBO), Intuit + Dataswitcher cost $0 for 2 years of history [https://quickbooks.intuit.com/dataswitcher/], and in the UK MoveMyBooks is free to Xero/QBO [https://movemybooks.co.uk/pricing/]. Ledgerlift's paying market is only the slice that (a) refuses QBO, or (b) wants deep history/archive. Size of that slice is UNVERIFIED.
5. Conflicting sunset dates in the wild (May 31, 2027 vs Sept 30, 2027 for QBD 2024) [https://www.sdocpa.com/quickbooks-desktop-discontinued/] [https://wizcommerce.com/blog/how-long-will-quickbooks-desktop-be-supported-discontinuation/] — verify against Intuit's official disco page before putting a date in marketing copy. Also note Enterprise is NOT sunsetting [https://www.sdocpa.com/quickbooks-desktop-discontinued/], so "QuickBooks Desktop is dying" is only true for Pro/Premier/Mac.
6. Trust asymmetry for a browser tool touching the books. Incumbents sell human accountability (E-Tech money-back guarantee, MoveMyBooks support staff). A no-name web app asking small businesses to drag in their entire financial history must overcome "is this a phishing site?" — the no-upload architecture helps but must be independently verifiable (open-source the parser? offline-capable PWA?).
7. Fragmented, versioned source formats. QBD spans US/CA/UK editions and ~20 file versions; IIF/report layouts shift across years (qb-escape maintains separate instructions for QB2017 vs QB2022-23 [https://raw.githubusercontent.com/erikmack/qb-escape/master/README.md]). Support matrix will sprawl; multi-currency and payroll files will generate the worst edge cases (Dataswitcher simply refuses payroll records [https://support.dataswitcher.com/support/solutions/articles/43000648882-conversion-limitations-quickbooks-desktop-qbdt-]).
8. Pricing anchor risk: $149 is priced above "free" (Dataswitcher/Intuit/MoveMyBooks) and below done-for-you ($275–$449 E-Tech, $399 WOW) — defensible, but per-COMPANY-FILE pricing will collide with accountants holding 30 client files; a firm tier is missing from the current model. (Analysis, not sourced.)
