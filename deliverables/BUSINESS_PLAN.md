# Bookstead — Business Plan

**"Your books, yours again."**

A 100% client-side web application that evacuates QuickBooks® Desktop history into (a) a permanent, self-contained offline HTML archive the owner keeps forever, and (b) migration packs for GnuCash, Manager.io, and generic CSV/JSON — with a trial-balance reconciliation diff that proves penny-perfect completeness *before* the user pays.

*Prepared July 2026. All facts carry inline source URLs. Items the research team could not verify against primary pages are explicitly flagged UNVERIFIED. Note: earlier research documents use the working name "Ledgerlift"; that name was eliminated after a collision check found live identical USPTO filings (serials 99635433, 99635415, https://uspto.report/TM/99635433) by an active bookkeeping firm at https://ledgerlift.com/. "Bookstead" cleared web, GitHub, app-store, and trademark-snippet checks with zero collisions; formal TESS clearance and a domain-broker quote remain to be done.*

*Intuit and QuickBooks are registered trademarks of Intuit Inc. Bookstead is not affiliated with, endorsed by, or sponsored by Intuit Inc.*

---

## 1. Executive Summary

Roughly a million US small businesses run their accounting on QuickBooks Desktop (QBD), a product Intuit stopped selling to new customers in September 2024 (https://quickbooks.intuit.com/learn-support/en-us/help-article/new-subscriptions/us-quickbooks-desktop-sold-july-2024/L5lkQNq7L_US_en_US) and now monetizes through renewal prices that have roughly tripled since 2021 — Pro Plus went from $349.99/yr to $1,149/yr as of February 1, 2026 (https://www.merchantmaverick.com/complete-guide-to-quickbooks-desktop-pricing/ ; https://www.kempercpa.com/news/upcoming-changes-to-quickbooks-desktop-pricing-effective-february-2026). A business that stops paying gets twelve months of view-only access to its own history, then nothing (https://quickbooks.intuit.com/learn-support/en-us/help-article/cancel-products-services/renew-subscription-use-view-mode-quickbooks-2023/L4IUEYTMg_US_en_US) — while the IRS requires that same business to produce its records for three to seven more years (https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records).

Every existing escape path either uploads the company's complete financial history to a third party, truncates it to two years, or dumps the user into a fragile DIY scripting project. No product on the market today does client-side, no-upload conversion or archiving of full QBD history — a gap verified by competitive teardown in July 2026 (see §6).

Bookstead fills exactly that gap:

- **Product**: a static web app (CSP `connect-src 'none'` — the no-upload claim is browser-enforced, not promised) that parses the exports QuickBooks Desktop itself produces, reconstructs the full general ledger, and emits a permanent offline HTML archive plus migration packs.
- **Proof before payment**: the free tier parses everything and shows a trial-balance reconciliation report — penny-level agreement with QuickBooks' own numbers — before any money changes hands. Product status: built, 26 tests passing, end-to-end verified — including penny-perfect reconciliation on a 6-year, 1,369-transaction fixture company and detection of sabotaged or filtered exports. Site and launch assets are production-ready.
- **Pricing**: Pro at $149 one-time per company file ($99 time-boxed launch price); Bookkeeper pack at $599 per 10 client files. Sold via merchant-of-record (Paddle or Lemon Squeezy, 5% + $0.50 per transaction, https://www.paddle.com/pricing).
- **Economics**: ~$113 contribution per $149 sale after fees, refunds, and modeled support cost; near-zero infrastructure because there are no servers.
- **Honest expectations**: three modeled 12-month scenarios net roughly $10.6k / $63k / $212k depending almost entirely on distribution (§7). This is a profitable indie business riding a multi-year forced-migration wave, not a venture-scale bet, and the plan says so.

The structural insight is that no incumbent can close this gap without breaking its own business model: Intuit profits from hostage data; destination platforms only subsidize two-year forward migrations into themselves; free ledgers have no revenue to fund the parsing grind; conversion services are priced on custody of the file. The niche is empty for reasons, and the reasons are durable (§4).

---

## 2. The Problem

### Businesses are being priced out of reading their own history

QuickBooks Desktop Pro Plus renewal pricing, single user:

| Year | Price | Source |
|---|---|---|
| 2021–22 | $349.99/yr | https://www.merchantmaverick.com/complete-guide-to-quickbooks-desktop-pricing/ |
| 2023 | $549/yr | https://www.hayniecpas.com/quickbooks-2023/ |
| Oct 2024 | $999/yr | https://quickbooks.intuit.com/learn-support/en-us/account-management/quickbooks-desktop-plus-subscription/00/1499653 |
| Oct 2025 | $1,049/yr (+$310/extra seat) | https://www.brownplus.com/blog/quickbooks-pricing-updates/ |
| Feb 2026 | $1,149/yr | https://www.kempercpa.com/news/upcoming-changes-to-quickbooks-desktop-pricing-effective-february-2026 |

(Note on the last two rows: one source set reports an Oct 1, 2025 step to $1,049 + $310/seat; the Feb 1, 2026 sources report $999 → $1,149 with seats $200 → $230. The intermediate steps and per-seat figures CONFLICT across sources and should be re-verified against Intuit's pricing page before use in marketing copy. The direction and magnitude — roughly 3x since 2021 — is consistent across all sources.)

Premier Plus followed the same curve to $1,609/yr (https://www.bradymartz.com/quickbooks-desktop-pricing-update-what-businesses-should-expect-in-2026/), and Enterprise Gold/Platinum customers running payroll got a new per-employee fee of $3.00 per active employee per month as of February 2026 (https://quickbooks.intuit.com/learn-support/en-us/help-article/intuit-subscriptions/understand-changes-per-employee-multi-company-file/L4uifTLCZ_US_en_US).

### Customers are saying so, verbatim

- *"2024 it was $47 month, 2025 $70 and todays notice $105! Another whopping 50% jump in pricing… Gouging is an understatement."* — "QuickBooks Desktop 2026 - HUGE price increases now annual - wow," Intuit's own community, April 2026 (https://quickbooks.intuit.com/learn-support/en-ca/other-questions/quickbooks-desktop-2026-huge-price-increases-now-annual-wow/00/1602611)
- A longtime customer reporting a ~$589 → ~$1,000/yr jump says an Intuit sales rep told them: *"If you don't like it, go find an alternative."* (https://quickbooks.intuit.com/learn-support/en-us/other-questions/longtime-customer-deeply-disappointed-by-quickbooks-pricing-and/00/1559617)
- A thread titled simply "PRICE GOUGING BY QUICKBOOKS" (https://quickbooks.intuit.com/learn-support/en-us/other-questions/price-gouging-by-quickbooks/00/1510185)
- And the demand for Bookstead's exact function, asked on Intuit's own forum with no good answer: *"How do i open a .QBW file without quickbooks desktop"* (https://quickbooks.intuit.com/learn-support/en-us/banking/how-do-i-open-a-qbw-file-without-quickbooks-desktop/00/1296167)

### The trap has a legal jaw

- **Stop paying, lose access.** When a post-2022 Plus subscription lapses, QuickBooks drops to view-only mode for one year — no new transactions, no reports, admin user only — and after that year, access ends entirely (https://quickbooks.intuit.com/learn-support/en-us/help-article/cancel-products-services/renew-subscription-use-view-mode-quickbooks-2023/L4IUEYTMg_US_en_US).
- **But the IRS doesn't stop asking.** Records must be kept 3 years from filing as a general rule, 6 years if income was underreported by more than 25%, 7 years for bad-debt/worthless-securities claims, and at least 4 years for employment tax records (https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records ; https://www.irs.gov/businesses/small-businesses-self-employed/employment-tax-recordkeeping).
- A business that quits QBD in 2026 must be able to produce 2020–2026 books through at least 2030. Intuit's window is 12 months. That gap is the product.

### And the alternatives are lossy or captive

Intuit's free migration to QuickBooks Online drops past reconciliation reports, memorized reports, budgets, custom templates, and the entire historical audit trail (https://www.hawkinsash.cpa/what-data-does-or-does-not-convert-from-quickbooks-desktop-to-quickbooks-online/), hard-fails on files over 750,000 targets (https://quickbooks.intuit.com/learn-support/en-us/help-article/import-export-data-files/move-quickbooks-desktop-file-quickbooks-online/L6af3Z0Fb_US_en_US), and its user threads include one literally titled "transition from quickbooks desktop to online - nightmare" (https://quickbooks.intuit.com/learn-support/en-us/account-management/transition-from-quickbooks-desktop-to-online-nightmare/00/1408800). Advisors inside Intuit's own funnel tell users to print PDFs of their reconciliation reports and audit trail before migrating — an admission that the archive job is unmet even on the happy path (https://www.hawkinsash.cpa/what-data-does-or-does-not-convert-from-quickbooks-desktop-to-quickbooks-online/).

The "keep an old laptop running" strategy dies with the hardware: discontinued perpetual versions cannot be activated for the first time, automated reactivation is a known brick wall, and assisted support for discontinued products has officially ended — a disk failure can permanently strand a paid-for license (https://quickbooks.intuit.com/learn-support/en-us/help-article/register-activate-services/fix-activation-license-product-numbers-errors/L2iGNZZQr_US_en_US).

---

## 3. The Product

### v1 scope — as built, today

Bookstead is a static web application. The user runs QuickBooks Desktop's own built-in, Intuit-documented export features — IIF list exports (https://quickbooks.intuit.com/learn-support/en-us/help-article/import-export-data-files/export-import-edit-iif-files/L56LT9Z0Q_US_en_US) plus report exports (Custom Transaction Detail / Journal, Trial Balance) — and drops the resulting files into the browser. Everything after that happens on the user's machine:

1. **Parse and reconstruct.** The engine rebuilds the full general ledger: chart of accounts, customers, vendors, every transaction with splits, across all years in the file. It handles the format's real-world pathologies defensively — version-varying IIF column sets, Windows-1252 vs UTF-8 encoding, report CSVs whose header row is not row 1, locale-dependent negatives-in-parentheses, `-SPLIT-` sentinel semantics that differ by report type, and Excel round-trip damage (per the format research in research-techspec.md §8).
2. **Prove it, free.** Before payment, the app computes a trial balance from the reconstructed ledger and diffs it penny-by-penny against the Trial Balance report the user exported from QuickBooks itself. Green means the parse is provably complete at the GL level. The engine also detects sabotaged or filtered exports — a date-filtered report or a deleted section produces a visible reconciliation failure, not a silently wrong archive. Status: built and tested — 26 automated tests, penny-perfect reconciliation on a 6-year, 1,369-transaction fixture company.
3. **Export (paid).**
   - **The Archive**: a single self-contained offline HTML file — searchable transaction register, drillable accounts, trial balance, P&L, and balance sheet for any year (retained-earnings rollover synthesized correctly, since QBD never writes closing entries), printable, dependent on nothing but a browser. It works in 2036 whether or not Bookstead exists.
   - **Migration packs**: GnuCash (CSV formatted for its importer's actual constraints — ISO dates, no mixed split formats, plus a step-by-step import README), Manager.io (Batch Create pack using the template-mirroring workflow, because Manager has "no specific interface to import from QuickBooks or any other software package" — https://forum.manager.io/t/importing-quickbooks-data/35354), and generic CSV/JSON for everything else.

**The privacy claim is architecture, not policy.** The site ships with Content-Security-Policy `connect-src 'none'` — after page load, the browser itself refuses any network request (https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/connect-src). Users can verify with DevTools open or the network cable pulled. No accounts, no telemetry on the app pages, no server that could be breached, subpoenaed, or shut down with the data inside.

### Deliberately excluded from v1 — and why honesty is the brand

| Excluded | Why |
|---|---|
| **Parsing .QBW/.QBB files directly** | QBW is an encrypted, undocumented Sybase SQL Anywhere database; no public parser exists (https://www.thegrideon.com/qb-internals-sql.html ; https://datisfy.com/the-truth-about-quickbooks-desktop-files/). Claiming otherwise would be false. Bookstead requires a working QBD install to run the exports — which means the honest marketing message is "evacuate NOW while it still opens," not "we rescue dead files." |
| **Payroll line-item detail, attachments, audit trail, memorized transactions, inventory assemblies** | These do not survive QBD's export surface — the same items Intuit's own Dataswitcher refuses (https://support.dataswitcher.com/support/solutions/articles/43000648882-conversion-limitations-quickbooks-desktop-qbdt-). The reconciliation proof covers the general ledger and trial balance, and the paywall says exactly that. Overclaiming completeness is the #1 refund and reputation risk (see §9). |
| **Migration into QuickBooks Online** | Intuit does it free (https://quickbooks.intuit.com/learn-support/en-us/help-article/import-export-data-files/move-quickbooks-desktop-file-quickbooks-online/L6af3Z0Fb_US_en_US). Competing with a free, vendor-subsidized path for customers who want to stay in the Intuit ecosystem is a losing use of a solo operation's time. |
| **File repair / corruption recovery** | Done-for-you shops with humans on the hook (E-Tech, $275–$449, https://quickbooksfilerepair.com/) own this; a self-serve browser tool cannot responsibly fix corruption. |
| **"Export your ledger as IIF" claims** | QuickBooks cannot export transactions via IIF — only lists (https://quickbooks.intuit.com/learn-support/en-us/help-article/import-export-data-files/export-import-edit-iif-files/L56LT9Z0Q_US_en_US). Marketing describes the real pipeline (IIF lists + report CSVs) precisely, per legal risk R5 (§9). |

A published "what transfers / what doesn't" matrix sits on the paywall. The product's core promise is not "everything" — it is "the general ledger, provably complete, forever readable."

---

## 4. The Wedge

The competitive gap (§6) is not an oversight. Each class of incumbent is structurally forbidden from closing it:

**Intuit needs hostage data.** Intuit's Desktop Ecosystem revenue *grew* 5% in FY2025 and 6% in Q3 FY2026 — on price, not units (https://www.sec.gov/Archives/edgar/data/0000896878/000089687826000025/intu-20260430.htm). The renewal-or-lose-access mechanic (view-only for 12 months, then nothing — https://quickbooks.intuit.com/learn-support/en-us/help-article/cancel-products-services/renew-subscription-use-view-mode-quickbooks-2023/L4IUEYTMg_US_en_US) is precisely what converts a shrinking installed base into growing revenue. A free, permanent, Intuit-independent archive would vaporize the single strongest reason lapsed customers keep paying. Intuit will never ship it.

**Destination platforms only fund two-year inbound summaries.** Intuit pays Dataswitcher for the last two years of history when you move to QBO (https://quickbooks.intuit.com/dataswitcher/); Xero and Intuit subsidize MoveMyBooks' free tier, which covers the current year plus one prior — extra years cost £75+VAT each (https://movemybooks.co.uk/pricing/). The subsidy exists to *acquire a subscriber*, and two years is all a subscriber needs to keep operating. Nobody subsidizes year eight of history, because year eight doesn't improve conversion to a paid subscription. Deep history is a cost center for every destination.

**Free ledgers can't fund the grind.** GnuCash's community has wanted a QuickBooks path since at least 2012 (https://lists.gnucash.org/pipermail/gnucash-user/2012-March/043760.html) and its collective answer remains "that format is secret" plus lossy CSV hacks. Manager.io's forum tells users to hand-stage Batch Create CSVs; one user automated ~1,000 checks with a macro recorder (https://forum.manager.io/t/importing-quickbooks-data/35354). The engineering grind of QBD's versioned, locale-riddled export formats (research-techspec.md §8 catalogs thirteen distinct format traps) is exactly the kind of unglamorous work volunteer projects never sustain — the canonical open-source route, qb-escape, is a 45-star Python project whose own README says "look closely before you trust what these scripts produce" (https://github.com/erikmack/qb-escape ; https://lwn.net/Articles/729087/).

**Conversion services need custody.** E-Tech ($275–$449), MoveMyBooks, MMC Convert, WOW BookSwitch ($399) are all send-us-your-file businesses (§6). Their pricing power *is* the custody: a human takes responsibility for your file. A verify-before-you-pay client-side tool would commoditize their labor model, so none of them will build it — and their upload requirement is exactly what a meaningful segment of owners and bookkeepers refuse ("my entire financial history, mailed to a stranger").

Bookstead sits in the one cell of the matrix — *full history, no upload, no destination lock-in, proof before payment* — that every incumbent's economics forbid them to enter.

---

## 5. Market Size

Bottom-up, with every assumption stated. Anchors are sourced; arithmetic and percentages are assumptions, labeled as such.

1. **Paying QBD subscriptions.** Intuit discloses no user counts — only revenue (checked FY2021–FY2025 10-Ks, https://www.sec.gov/Archives/edgar/data/896878/000089687825000035/intu-20250731.htm). FY2025 Desktop Accounting revenue of $1,672M (figure seen in search summaries of the 10-K; UNVERIFIED against the filing itself) divided by a blended ARPU of $1,000–$1,600 implies roughly 1.0–1.6M paying subscriptions worldwide, corroborated by a reseller estimate of "over one million active Desktop users" (https://www.fourlane.com/blog/state-of-quickbooks-desktop-for-2026/). At an 84% US share (https://6sense.com/tech/small-business-accounting/quickbooks-desktop-market-share): **~0.9–1.35M US paying files**, plus an uncounted tail of legacy perpetual-license holders (UNVERIFIED, plausibly low hundreds of thousands).
2. **Stranded segment.** Pro/Premier/Mac Plus subscribers — stop-sold since September 2024, renewals $1,149–$1,609/yr — assumed at 60–75% of the unit base (Enterprise skews revenue, not units; split UNVERIFIED, Intuit does not disclose it): **~550K–1,000K US businesses**.
3. **Exit events.** Assume 15–30% of the stranded base exits desktop per year from 2026–2029, driven by ~3x price escalation and the annual sunset cadence: **~450K–800K cumulative US "leave QBD" events** through ~2029. (Assumption, not a sourced fact.)
4. **Gross TAM** at $99–$149 per event: **$45M–$120M** through ~2029.
5. **Realistic SAM.** Only a fraction will self-serve a browser tool rather than take Intuit's free QBO path, hire it out, or do nothing: assume 10–20% ⇒ **$5M–$25M**.
6. **Realistic capture.** 2–5% of SAM ⇒ **$250K–$1.25M cumulative revenue** — a solid solo/indie business with strong margins, not a venture-scale outcome. The three operating scenarios in §7 are consistent with the low-to-middle of this range in year one.

Honesty notes that survive contact with a skeptic: the market only shrinks (renewals-only since 2024); no authoritative installed-base number exists anywhere; Enterprise is not sunsetting and is excluded from the core market; and Intuit's free two-year QBO path will absorb the majority of exits. The plan does not need those users — it needs the archive-motivated, privacy-motivated, and subscription-refusing minority, which the demand signals in §2 and §8 show exists.

---

## 6. Competition

Teardown as of July 2026 (full detail in research-competition.md):

| Competitor | What it is | Price | History depth | Destinations | Upload required? |
|---|---|---|---|---|---|
| Intuit QBD→QBO tool | Free in-product migration | Free | Full file, hard fail >750k targets | QBO only | Yes (to Intuit) |
| Dataswitcher (Intuit-embedded) | Server-side conversion | Free for last 2 yrs (Intuit pays); ~$70/extra year | 2 yrs free, more paid | QBO only | Yes — QBW/QBB uploaded, 2–4 business days |
| MoveMyBooks (UK/IE) | Server-side conversion | Free standard (vendor-subsidized); £75+VAT/extra yr; assisted £245+VAT | Current + 1 prior yr free | Xero, QBO | Yes |
| E-Tech / QuickBooksRepairPro | Done-for-you repair & conversion | $275–$449 | Whole file | QB-family formats | Yes — send them the file |
| WOW BookSwitch | Done-for-you QBD→Xero | $399 flat (+$100/extra yr) | 3 yrs + current FY | Xero | Yes |
| MMC Convert | Offshore done-for-you | Quote-based | Varies | Xero, QBO, FreshBooks, FreeAgent | Yes |
| Wave | Official path is manual | Free | Zero history — opening balances only (https://support.waveapps.com/hc/en-us/articles/32526944035092-Switch-to-Wave-from-Quickbooks) | Wave | n/a |
| toqbo.com / ProperConvert | Client-side/local converters | Freemium / paid | Bank-transaction files only, not company history | QBO/IIF/CSV | No |
| qb-escape (open source) | DIY scripts | Free | Full journal, hand-exported and hand-cleaned | GnuCash only | No, but hours of manual work |
| Status quo (old laptop) | Keep QBD read-only | $0 marginal | Everything | None | No — but dies with the hardware/activation wall |
| **Bookstead** | **Client-side archive + migration packs, verify-before-pay** | **$149 flat, all years** | **Full history** | **Offline archive + GnuCash, Manager.io, CSV/JSON** | **No — browser-enforced** |

**The central finding: nobody does client-side/no-upload for company history.** The only tools that keep data local (toqbo.com, ProperConvert) convert bank-statement files *into* QuickBooks, not company history out of it (https://toqbo.com/ ; https://www.propersoft.net/). Every real history converter — Dataswitcher, MoveMyBooks, E-Tech, MMC — requires surrendering the company file. The competitive research's verdict: "NO existing product does client-side, no-upload conversion or archiving of full QBD company history."

Four verified gaps Bookstead occupies alone: (1) the permanent offline archive as a product — everyone else converts forward, nobody sells "readable forever, no QuickBooks required"; (2) no-upload privacy; (3) full-depth history at a flat price, against per-year metering (£75/yr, $70–100/yr) that makes a 15-year file expensive or truncated; (4) trial-balance proof *before* payment — MoveMyBooks tells users to check the TB themselves afterward (https://movemybooks.com/kb/troubleshooting/), and services offer money-back guarantees, not pre-purchase proof.

Where competitors win, Bookstead doesn't fight: QBD→QBO switchers (Intuit is free), corrupt-file repair (E-Tech has humans), UK/IE standard conversions (MoveMyBooks is free to the user).

---

## 7. Business Model & Pricing

### Tiers

- **Free**: parse everything, see the full trial-balance reconciliation report. (The demo *is* the trust mechanism — and the marketing.)
- **Pro — $149 one-time per company file.** Launch price $99, visibly time-boxed 6–8 weeks and labeled "launch pricing" so the raise is pre-legitimized. $149 is 13% of a single year's Pro Plus renewal and sits between "free but captive" (Intuit/Dataswitcher) and done-for-you ($275–$449). Planned raise to $179–$199 once testimonials exist — the value anchor supports it (https://www.kempercpa.com/news/upcoming-changes-to-quickbooks-desktop-pricing-effective-february-2026).
- **Bookkeeper — $599 per 10 client files** ($59.90/file), per the pricing research's recommendation to price above the originally floated $499. Bookkeepers are the *least* price-sensitive buyer — they rebill decommissioning to clients (professional conversions run £245+VAT at MoveMyBooks and up; https://movemybooks.co.uk/pricing/) — and in a fully client-side app, per-file licensing is honor-system anyway (no server, no metering). The pack's real product is legitimacy, volume convenience, and an invoice their firm can process; it is priced for that, not for enforcement.

### Unit economics (base case, $149 Pro sale, Paddle MoR at 5% + $0.50 — https://www.paddle.com/pricing)

| Item | $ |
|---|---|
| Gross price | 149.00 |
| MoR fee (5% + $0.50) | −7.95 |
| Refund reserve (2%; benchmarks 2–5% for digital products, https://count.co/metric/refund-rate — verify-before-pay should hold the low end) | −2.98 |
| Support (1.0 ticket/sale @ $25 blended; SaaS benchmarks $18–35/ticket, https://livechatai.com/blog/customer-support-cost-benchmarks) | −25.00 |
| **Contribution** | **≈ $113 (76%)** |

Infrastructure is ~$0–20/month (static hosting; no runtime servers by design). Support — not fees — is the real COGS, and it is the strongest quantitative argument against pricing lower: at $99, support + fees + refunds consume ~32% of revenue; at $149, ~23%.

### Three 12-month scenarios (Jul 2026 – Jun 2027)

Modeled with Paddle fees, blended Pro pricing ($99 launch → $149), refunds and support as above. (Scenarios were originally modeled with the bookkeeper pack at $499/10; at the adopted $599 price, Base and Upside improve by roughly $1.5k and $6k respectively — immaterial to the conclusions.) Traffic is the dominant unverified variable in all three.

| | Conservative | Base | Upside |
|---|---|---|---|
| Relevant visits/yr | ~14,000 (SEO from scratch, a few forum hits) | ~36,000 (SEO on sunset/price-hike terms catches the Feb-2026 outrage wave) | ~96,000 (requires a viral distribution event: HN/Reddit front page, press pickup) |
| Activation → free users | 7% → ~1,000 | 10% → 3,600 | 12% → 11,500 |
| Free → paid | 8% → 80 Pro sales | 12% → 432 Pro sales | 15%, capped at 1,400 sales by solo support capacity |
| Bookkeeper packs | 4 | 15 + 5 repurchases | 60 incl. repurchases |
| **Net revenue** | **≈ $10,600** | **≈ $63,200** | **≈ $211,600** |
| After support cost | ≈ $7,300 | ≈ $47,700 | ≈ $170,000 |

Sensitivities worth an investor's attention: revenue is roughly linear in traffic and in free→paid conversion; a ±50% error in either moves every scenario by the same factor. Price changes of ±$50 move revenue ~±30% with negligible conversion effect at these value gaps. In the Upside case, support hours — not demand — become the binding constraint, which argues for early investment in self-serve docs and error-message quality.

Free→paid assumptions are anchored: classic freemium converts 2–5% (https://www.withdaydream.com/library/insights/freemium-conversion-rate), opt-in trials 15–20%+ (https://www.amraandelma.com/free-trial-conversion-statistics/); a user who exports their company file and sees a green reconciliation proof is closer to a completed trial than a casual free user, hence the 8/12/18% band.

MoR note: Lemon Squeezy's post-Stripe-acquisition trajectory is uncertain (UNVERIFIED; https://www.lemonsqueezy.com/pricing), and Paddle's approval process can reject new solo sellers (UNVERIFIED for this category). Mitigation: apply to both before launch, treat Paddle as default.

---

## 8. Go-To-Market: First 30 Days

One correction applies to all outreach below: the drafted posts in research-gtm.md describe "reverse-engineering the QBW format," which is *not* what the built product does — it parses QBD's own IIF and report exports. Every draft must be revised to describe the real pipeline before posting. This is both a legal requirement (false-advertising risk R5, §9) and a survival requirement: HN and bookkeeper audiences will test the claim within hours, and the free tier is also the free-falsification tier.

### Week 1 — Foundations
- Publish the site with the free reconciliation tier live, the "what transfers / what doesn't" matrix, the trademark disclaimer set (§9), and the CSP-enforced privacy page ("verify it yourself: open DevTools").
- Apply to Paddle and Lemon Squeezy in parallel (approval can take weeks; UNVERIFIED timing).
- Ship the 8 SEO pages (below) — the market's search demand is documented and the incumbent content is weak.

### The 8 SEO targets (each with live search-intent evidence, from research-gtm.md §9)
1. **"open qbb file without quickbooks"** — a content-farm cluster with no real product answer (https://www.hostdocket.com/open-quickbooks-file-without-quickbooks/ ; https://www.acecloudhosting.com/blog/open-qb-files-without-quickbooks/)
2. **"open qbw file without quickbooks desktop"** — live Intuit thread with no good answer (https://quickbooks.intuit.com/learn-support/en-us/banking/how-do-i-open-a-qbw-file-without-quickbooks-desktop/00/1296167)
3. **"quickbooks desktop discontinued / end of support 2026"** — heavy publisher activity signals volume (https://www.sdocpa.com/quickbooks-desktop-discontinued/ ; https://www.method.me/blog/quickbooks-desktop-discontinued/)
4. **"quickbooks desktop alternatives no subscription / one-time purchase"** — take the long-tail modifier; the head term is owned by NerdWallet/FitSmallBusiness (https://fitsmallbusiness.com/best-quickbooks-alternative/)
5. **"quickbooks to gnucash"** — recurring mailing-list demand since 2012, no tooling answer (https://lists.gnucash.org/pipermail/gnucash-user/2012-March/043760.html)
6. **"import quickbooks into manager.io"** — live forum demand, only manual workarounds (https://forum.manager.io/t/importing-quickbooks-data/35354)
7. **"quickbooks desktop 2026 price increase"** — news-jack page riding the rage threads (https://www.business2community.com/small-business/quickbooks-price-increase-2026-cost-breakdown/)
8. **"export all transactions from quickbooks desktop to csv"** — Intuit's own help article covers lists only, not full history (https://quickbooks.intuit.com/learn-support/en-us/help-article/manage-lists/import-export-csv-files/L9AiGRdT9_US_en_US)

### Weeks 2–3 — Community seeding (rules-first)

| Channel | Approach | Promo policy |
|---|---|---|
| **Show HN** | The drafted post (research-gtm.md §10a, revised to the export-based pipeline): title under 80 chars, free tier usable without signup, price stated up front, invite technical scrutiny. Precedents show local-first/no-upload converters reliably resonate (VERT, Apr 2025: https://news.ycombinator.com/item?id=43663865 ; NoUploadTools, Jan 2026: https://news.ycombinator.com/item?id=46516400). Commercial products are allowed (https://news.ycombinator.com/showhn.html). Expect "open-source it" pressure — prepared answer in §9. | Allowed with norms |
| **Manager.io forum** | Reply-in-thread (https://forum.manager.io/t/quickbooks-to-migrate/66678), affiliation disclosed in line one, per the draft in research-gtm.md §10b. Vendor-run Discourse; a new-account promo thread is a likely instant flag — promo rules UNVERIFIED, read the FAQ first or ask mods. | Unverified — reply, don't launch-post |
| **r/Bookkeeping** | The drafted post (research-gtm.md §10c) *after* 2–4 weeks of genuine comment participation (Reddit 90/10 norms: https://redship.io/blog/reddit-self-promotion-rules). Subscriber count and sidebar rules UNVERIFIED — check before posting. | Check sidebar first |
| **r/QuickBooks** | Value-first comments on live sunset/price threads; rules UNVERIFIED (https://www.nerdwallet.com/business/software/learn/quickbooks-community-support-online). | Check sidebar first |
| **GnuCash users mailing list** | Plain-text, no marketing: "I built a QBD→GnuCash CSV path, verification free, here's the mapping doc." List culture receives paid-tool announcements poorly otherwise (https://lists.gnucash.org/pipermail/gnucash-user/2014-March/053771.html). | Tolerated if framed as a solution write-up |
| **ERPNext/Frappe** | One helpful comment on the QuickBooks Migration Tool feature request (https://github.com/frappe/erpnext/issues/50975) and the discuss.frappe.io thread — low volume, perfectly targeted. | Fine |

**Channels that ban or punish promotion — do not post product links:** r/smallbusiness (2.47M members) bans promotion posts outright, weekly thread only (https://rankhog.com/subreddits/smallbusiness); r/Accounting is a career sub with poor product fit — deprioritized; Intuit's own community moderates out competitor links — its rage threads are quote sources and SEO targets, never posting venues.

### Week 4 — Professional channel
- Bookkeeper Facebook groups: Bookkeeping Side Hustle (~16,000 members per its own partnership page, which sells legitimate paid promo slots — https://www.bookkeepingsidehustle.com/partner-opportunities/) and The Successful Bookkeeper (10,000+, https://www.workflowqueen.com/blog/best-bookkeeping-groups). Lead with the Bookkeeper pack and the free verification step; expect and prepare for the two questions the GTM research predicts: "what's the refund policy?" and "what happens to my archives if the site disappears?" (Answer to the second is the product itself: the archive is a self-contained offline file.)
- Every post everywhere links the free tier, not the checkout page. The reconciliation report is the ad.

---

## 9. Risks & Mitigations

**1. Data fidelity — the existential product risk.** A trial balance can reconcile while payroll detail, attachments, memos, or inventory assemblies disappoint; QBD's export formats are a minefield of version- and locale-dependent traps (thirteen catalogued in research-techspec.md §8, from IIF's lack of escaping to Excel-injected `#REF!` corruption). *Mitigations:* the free-verification-before-payment flow makes every parse failure visible before it costs a customer money; the v1 scope is deliberately fenced to the general ledger with a published what-transfers matrix; malformed rows quarantine rather than derail; sabotage/filter detection is already built and tested. Residual risk is real and priced into the 2–3% refund reserve.

**2. Intuit trademark exposure.** Intuit demonstrably enforces against domains (multiple WIPO UDRP wins, e.g. https://www.wipo.int/amc/en/domains/decisions/html/2009/d2009-1439.html) but tolerates a 15-year ecosystem of converters using "QuickBooks" nominatively — Zed Axis is listed on Intuit's own app store (https://quickbooks.intuit.com/app/apps/appdetails/zed_axis_import_qbo/en-us/), and Intuit's published trademark policy expressly sanctions "compatible with"-style statements (https://www.intuit.com/legal/trademark/ — page 403'd to the research fetcher; wording from search excerpts, UNVERIFIED verbatim; a human must pull the page before launch). *Mitigations — nominative fair use discipline per New Kids on the Block v. News America, 971 F.2d 302 (9th Cir. 1992) (https://cyber.harvard.edu/metaschool/fisher/domain/tmcases/newkids.htm):* word mark only with ® at first use; footer attribution "Intuit and QuickBooks are registered trademarks of Intuit Inc."; visible no-affiliation disclaimer; no Intuit logos, no green trade dress, no "QB"/"QBO" abbreviations; "QuickBooks" never the primary element of a name, domain, or ad headline; keep a nominative-fair-use memo on file so any C&D is answerable by pointing at Intuit's own policy. The "Bookstead" name and domain contain no Intuit strings by design. Truthful comparative reference is protected (Smith v. Chanel, 402 F.2d 562 (9th Cir. 1968), https://law.justia.com/cases/federal/appellate-courts/F2/402/562/446662/). No published Intuit lawsuit against a compatible converter was found — though private C&Ds would be invisible (UNVERIFIED as a guarantee).

**3. The privacy claim as regulatory exposure.** FTC v. Zoom shows misrepresented privacy properties draw 20-year consent orders (https://www.ftc.gov/news-events/news/press-releases/2020/11/ftc-requires-zoom-enhance-its-security-practices-part-settlement). A single analytics beacon on the app page falsifies "never leaves your browser." *Mitigations:* CSP `connect-src 'none'` plus locked `form-action`/`img-src`; zero third-party scripts; self-hosted assets; offline-capable demo; if any telemetry ever exists anywhere on the site, the claim gets scoped rather than absolute.

**4. Support load.** At $25–38 modeled cost per sale, support is 3–5x the payment fee, and in the upside scenario it caps revenue before demand does. Corrupt files, ancient QBD versions, 1GB+ files in a browser, payroll edge cases. *Mitigations:* the free tier filters unsupported files before purchase; error messages written as self-serve documentation; a supported-versions matrix; and pricing ($149, not $49) that funds the tickets.

**5. "QuickBooks Desktop is dying" is only partly true.** Enterprise is still sold to new customers with no announced end date (https://quickbooks.intuit.com/r/whats-new/quickbooks-desktop-stop-sell/), QBD 2024 receives continuous "R" updates, and Desktop revenue is still growing on price (https://www.sec.gov/Archives/edgar/data/0000896878/000089687826000025/intu-20260430.htm). *Mitigation:* marketing targets the cohorts for whom the death is real — lapsing Plus subscribers and dead-version holdouts — and never claims a blanket shutdown. This is also why the plan's market math uses the stranded Pro/Premier segment, not the whole base.

**6. View-only-mode export uncertainty.** Sources establish that view-only mode blocks running reports (https://quickbooks.intuit.com/learn-support/en-us/help-article/cancel-products-services/renew-subscription-use-view-mode-quickbooks-2023/L4IUEYTMg_US_en_US) but do not establish whether data *export* still works — UNVERIFIED and product-test required. If export is blocked, the addressable moment narrows to "before lapse." *Mitigation:* all messaging already says "evacuate while it still opens"; a lapsed user who can't export is told the truth (renew for one month, export, cancel) rather than sold a false rescue.

**7. "Open-source it" pressure from HN.** Every successful local-first Show HN precedent found is free or open source (research-gtm.md §8); a $149 closed tool will get pushback, and trust in a no-name app touching the books is the deeper issue. *Mitigations:* free tier requires no signup (satisfies Show HN norms); the archive output is inspectable HTML; publish the format documentation and reconciliation methodology openly (defuses most of the pressure at zero business cost); consider open-sourcing the parser with a paid app around it if trust proves to be the binding constraint — the pricing power is in the packaged proof-and-archive workflow, not the parsing secret. Subresource Integrity and a reproducible build make the deployed bundle verifiable (https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Subresource_Integrity).

**8. Founder concentration.** Bookstead is built and operated by a single autonomous founder; there is no team redundancy. *Mitigations:* the product degrades gracefully by design — archives are self-contained and outlive the company; the static site has no operational surface to babysit; documentation is written so a successor (or the customers themselves) need nothing from the founder.

---

## 10. Why Now

The window is open because four dated events stack on top of each other, and the calendar keeps re-detonating:

1. **September 30, 2024 — stop-sell.** Intuit stopped selling QBD Pro Plus, Premier Plus, and Mac Plus to new US subscribers (https://quickbooks.intuit.com/learn-support/en-us/help-article/new-subscriptions/us-quickbooks-desktop-sold-july-2024/L5lkQNq7L_US_en_US). QBD 2024 is the last annual version; the base only shrinks from here — every remaining user is on a conveyor belt toward an exit decision.
2. **May 31, 2026 — QBD 2023 sunset, six weeks ago.** Payroll, payments, bank feeds, and security updates died for the 2023 version (https://quickbooks.intuit.com/learn-support/en-us/help-article/feature-preferences/quickbooks-desktop-service-discontinuation-policy/L17cXxlie_US_en_US ; https://www.certumsolutions.com/library/quickbooks-desktop-2023-service-ending-may-2026). This is the freshest urgency wave — those users are deciding *right now* whether to pay $1,149+ to move to v24, migrate, or leave.
3. **February 1, 2026 — the price hike that radicalized the base.** Pro Plus to $1,149, Premier Plus to $1,609, Enterprise +10% with new per-employee payroll fees (https://www.kempercpa.com/news/upcoming-changes-to-quickbooks-desktop-pricing-effective-february-2026). The community response is the marketing copy: *"Another whopping 50% jump in pricing… Gouging is an understatement"* (https://quickbooks.intuit.com/learn-support/en-ca/other-questions/quickbooks-desktop-2026-huge-price-increases-now-annual-wow/00/1602611); a UK charity seeing £32→£56+VAT/mo (https://quickbooks.intuit.com/learn-support/en-uk/other-questions/2026-massive-price-increase/00/1591627); *"If you don't like it, go find an alternative"* from Intuit's own sales rep (https://quickbooks.intuit.com/learn-support/en-us/other-questions/longtime-customer-deeply-disappointed-by-quickbooks-pricing-and/00/1559617). One migration guide claims desktop subscription costs increased "approximately 400% from 2023 to 2025 for some users" (https://ifeeltech.com/blog/quickbooks-desktop-alternatives).
4. **The re-detonation schedule.** This is not a one-time event. Every May 31, another version-year sunsets (2021→2024, 2022→2025, 2023→2026 — https://www.rklesolutions.com/blog/quickbooks-desktop-retiring-may-2025), every autumn brings a renewal-price letter, and each cycle manufactures a fresh cohort of motivated evacuees. The QBD 2024 sunset date is CONFLICTING across sources — May 31, 2027 vs September 30, 2027 vs claims of continuous support (https://www.sdocpa.com/quickbooks-desktop-discontinued/ ; https://wizcommerce.com/blog/how-long-will-quickbooks-desktop-be-supported-discontinuation/ ; https://clonepartner.com/blog/quickbooks-desktop-discontinued-full-sunset-timeline-through-2027) — so the 2027 marketing beat exists but its exact date must be re-verified against Intuit's official page before it goes in copy.

And the trap mechanism itself is recent: only post-2022 subscription-only versions have the view-only-then-nothing lockout (https://quickbooks.intuit.com/learn-support/en-us/help-article/cancel-products-services/renew-subscription-use-view-mode-quickbooks-2023/L4IUEYTMg_US_en_US). The first large cohorts to face "pay $1,149 or lose the ability to read your own history in 12 months" are facing it *now*. Three years ago this product had a smaller problem to solve; three years from now the sharpest wave will have passed. The peak of the motivated market is 2026–2028, and under-monetizing it (e.g., holding the $99 launch price too long) is itself a named risk in the pricing research.

---

## 11. Why This Wins

The honest argument, in five parts:

1. **The pain is real, documented, and legally mandated.** Not inferred from surveys — quoted verbatim from Intuit's own community, priced in Intuit's own renewal letters, and enforced by the IRS's retention rules. The customer doesn't need to be convinced they have a problem; they need to find the product.
2. **The gap is structural, not accidental.** Every incumbent class is barred from this position by its own economics (§4). Intuit cannot free the hostages; destinations won't fund deep history; volunteers won't sustain the format grind; custody shops won't give up custody. A gap with structural causes stays open.
3. **The trust problem — the hardest problem for a no-name financial tool — is solved by architecture, not assertion.** No upload (browser-enforced by CSP), and proof of correctness shown in full before payment. The product's most expensive engineering feature, the reconciliation diff, is given away free because it *is* the sales process. Nobody in this market offers pre-purchase proof (§6).
4. **The economics survive small.** ~76% contribution margin, no servers, no inventory, no marginal COGS but support. The conservative scenario ($10.6k) is disappointing but not fatal; there is no burn rate to outrun. The business is default-alive at any traffic level, which is the correct shape for a solo operation riding a multi-year wave.
5. **Honesty compounds.** The plan fences what v1 doesn't do (no QBW parsing, no payroll detail, no dead-file rescue) and says so on the paywall. In a market whose incumbent just taught a million customers what it feels like to be misled about pricing, "we will show you exactly what you get before you pay us" is not just ethics — it is the positioning.

**What would kill it — stated plainly:**

- **Distribution failure.** Every revenue scenario is linear in traffic, and the founder starts with zero domain authority. If the SEO pages don't rank and no community post lands, this is a $10k/year business. This is the single largest risk and it is not fully controllable.
- **Intuit removing the reason to leave** — e.g., shipping a free, full-history, permanent export or a cheap perpetual archive tier. Judged unlikely (it would cannibalize the renewal mechanic that grew Desktop revenue 5–6% on a shrinking base, https://www.sec.gov/Archives/edgar/data/0000896878/000089687826000025/intu-20260430.htm), but Intuit controls the trap and can open it.
- **The export path closing.** If view-only mode blocks data export (UNVERIFIED, §9.6) and Intuit further restricts report exports in v24 updates, the addressable moment narrows to actively-subscribed users only.
- **A public fidelity failure.** One bookkeeper posting "the trial balance matched but X was wrong" in a 16,000-member Facebook group could poison the professional channel. The fenced scope and quarantine-don't-guess parser design exist precisely to prevent this, but the risk never reaches zero.
- **Market evaporation faster than modeled.** If 80%+ of exits take Intuit's free QBO path and the archive-motivated minority is 2% rather than 10–20% of exits, SAM shrinks below viability. No source exists that can settle this in advance; the free tier's activation rate in the first 90 days is the test.

The bet, precisely stated: for a few hundred thousand US businesses over the next three years, the moment of leaving QuickBooks Desktop is a moment of maximum distrust — of Intuit, of upload-your-file services, and of subscriptions in general. Bookstead is the only product built to be trusted at exactly that moment, because it is the only one that doesn't ask for trust at all: it proves its work first, keeps nothing, and hands the customer a file that will outlive everyone involved — including, if it comes to that, Bookstead itself.

---

*Sources: all URLs inline above; underlying research with method notes and full red-flag registers in /home/user/notesapp/deliverables/research/ (research-market.md, research-competition.md, research-pricing.md, research-gtm.md, research-legal.md, research-naming.md, research-techspec.md). Research-environment caveat inherited from all files: the sandbox proxy blocked direct page fetches for many hosts, so several figures were verified only via search-result content of the cited URLs; every such item is flagged UNVERIFIED above and must be re-confirmed against primary pages before use in customer-facing copy.*
