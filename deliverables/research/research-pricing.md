# Ledgerlift — Pricing & Unit Economics Stress Test
Research date: 2026-07-11. All figures carry inline sources; unverified items are marked UNVERIFIED.

---

## 1. Verified pricing anchors

### 1.1 What the customer is escaping (QuickBooks Desktop costs)

The prompt's anchor of "$810–1,000+/yr" is **stale — prices are now higher**, which strengthens the value story:

| QBD product (renewal, single user) | Pre-Feb-2026 | Effective Feb 1, 2026 |
|---|---|---|
| Pro Plus / Mac Plus | $999/yr | **$1,149/yr** (+$230/extra seat, up from $200) |
| Premier Plus | $1,399/yr | **$1,609/yr** (+$345/extra seat, up from $300) |
| Enterprise Silver | — | from **$1,873/yr** |
| Enterprise Gold / Platinum | — | $2,210 / $2,717/yr, plus NEW per-employee monthly fees |

Sources:
- https://www.kempercpa.com/news/upcoming-changes-to-quickbooks-desktop-pricing-effective-february-2026
- https://www.bradymartz.com/quickbooks-desktop-pricing-update-what-businesses-should-expect-in-2026/
- https://blog.insightfulaccountant.com/intuit-announces-pricing-changes-for-quickbooks-desktop
- https://quickbooks.intuit.com/desktop/enterprise/pricing/

Context: Intuit stopped selling **new** QBD Pro/Premier Plus subscriptions in 2024; only renewals continue (same Kemper/Brady Martz sources). This means the addressable base is large but **shrinking** — the migration window is real and time-boxed (roughly 3–5 more years of meaningful volume; timing estimate is my inference, UNVERIFIED).

Implication: a $149 one-time price is **13% of a single year's Pro Plus renewal** and ~8% of Enterprise Silver. The value anchor supports a materially higher price than proposed.

### 1.2 What competitors charge for conversion/migration

| Competitor | Price | Notes |
|---|---|---|
| Intuit/Dataswitcher (QBD→QBO) | **Free for 2 yrs of history**; +$70 per additional year | Intuit-subsidized; destination is a QBO subscription. https://quickbooks.intuit.com/dataswitcher/ ; https://quickbooks.intuit.com/learn-support/en-ca/help-article/company-file/comprehensive-guide-moving-data-quickbooks-online/L3H7yiz2y_CA_en_CA |
| MoveMyBooks (UK) | Free 2 yrs (Intuit-funded); +£75/extra year; +£75 for Classes; **£245+VAT** full professional service | https://movemybooks.co.uk/pricing/ ; https://movemybooks.co.uk/free-conversions-courtesy-of-intuit-quickbooks-and-movemybooks/ |
| WOWBookSwitch (QBD→Xero) | **$399 flat** (3 yrs + current FY); +$100/extra year | https://wowbookswitch.com/ |
| Jet Convert (QB→Xero, Xero's partner) | Current + prior FY free via Xero; paid packages for more history (page returned 403; exact USD tiers UNVERIFIED) | https://jetconvert.com/usa-pricing/ ; https://www.xero.com/us/accounting-software/convert-from-quickbooks/ |
| Manual bookkeeper/CPA re-entry or bespoke conversion | Commonly quoted $400–$2,000 range in the brief — I could **not** pin a single citable published range; directionally consistent with WOWBookSwitch $399 floor + hourly professional work. **UNVERIFIED as a specific range.** | — |

Key competitive read: the "free" competitor (Intuit-funded 2-year conversions) only takes you **into** the Intuit ecosystem ($/yr forever) and drops history beyond 2 years. Ledgerlift's wedge — full history, offline permanence, escape to free/cheap tools (Manager.io/GnuCash), verify-before-pay, client-side privacy — is genuinely un-served at $149. Nearest true comparable is WOWBookSwitch at $399 with server-side processing.

---

## 2. Merchant-of-record take rates (verified July 2026)

| MoR | Headline fee | Real-world adders |
|---|---|---|
| **Paddle** | 5% + $0.50/txn | FX conversion margin ~2–3% on non-USD payouts; **$20 per chargeback**. https://www.paddle.com/pricing ; https://dodopayments.com/blogs/paddle-fees-explained |
| **Lemon Squeezy** | 5% + $0.50/txn | +1.5% international card, +1.5% PayPal, +0.5% subscriptions; intl payout fee 1%. https://www.lemonsqueezy.com/pricing ; https://docs.lemonsqueezy.com/help/getting-started/fees |

Effective take on a **$149** sale: base $7.95 (5.34%); with intl surcharge ~ $10.19 (6.8%). On a **$99** sale: $5.45 (5.5%). On **$499**: $25.45 (5.1%). Flat fees hurt small prices; another argument against pricing low.

Note: Lemon Squeezy was acquired by Stripe (2024) and community reports of slowed product development persist — reliability status in mid-2026 UNVERIFIED; Paddle is the safer default, but Paddle's seller-approval process can reject new solo sellers/products (known onboarding friction; UNVERIFIED for this product category — apply early).

---

## 3. Refund model for a verify-before-pay product

Benchmarks: digital-product refund rates typically **2–5%**, with <2% considered strong (https://count.co/metric/refund-rate ; https://www.kissmetrics.io/glossary/refund-rate ; https://www.richpanel.com/learn/ecommerce-return-rates).

Ledgerlift's design (trial-balance reconciliation proof shown **before** payment) removes the #1 refund driver for migration tools ("it didn't convert my file correctly"). Model assumptions:
- Conservative: 3% refunds (payment mistakes, buyer's remorse, edge-case data the proof didn't cover, e.g. payroll detail, attachments)
- Base: 2%
- Upside: 1%
Plus chargebacks at ~0.2–0.4% of transactions × $20 fee (Paddle) — immaterial at this scale.

Residual refund risk to design around: the TB can reconcile while **non-financial detail** (memos, attachments, payroll line items, inventory assemblies) disappoints. State scope explicitly on the paywall to keep refunds near the low end.

---

## 4. Support cost per sale

Published benchmarks: SaaS support runs **$18–35/ticket**, rising to $50–100 when engineering-level investigation is needed (https://livechatai.com/blog/customer-support-cost-benchmarks ; https://www.lorikeetcx.ai/articles/customer-service-cost-per-ticket). Migration products skew ticket-heavy (weird file versions, corrupt QBW/QBB files, giant files, edge-case transactions).

Model (my estimates, UNVERIFIED as published migration-specific data does not exist):
- Tickets per paid sale: 0.6 (upside, good docs/self-serve) / 1.0 (base) / 1.5 (conservative, early product)
- Cost per ticket: $25 blended (founder time valued, occasional deep debugging at $50–100)
- **Support cost per sale: ~$15 (upside) / $25 (base) / $38 (conservative)**
- Free users also generate tickets (~1 ticket per 20 activated free users) — a real founder-time tax that the free reconciliation step front-loads.

At $99, base-case support ($25) + MoR fee ($5.45) + 2% refunds ≈ **32% of revenue gone**. At $149 it's ~23%. At $199 it's ~18%. The flat support cost per sale is the strongest quantitative argument for a higher price.

### Per-unit contribution (base case, $149 Pro sale, Paddle)
| Item | $ |
|---|---|
| Gross price | 149.00 |
| MoR fee (5% + $0.50) | −7.95 |
| Refund reserve (2%) | −2.98 |
| Support (1.0 ticket @ $25) | −25.00 |
| **Contribution** | **≈ $113 (76%)** |

Zero runtime infra confirmed by architecture (client-side); hosting ≈ $0–20/mo static.

---

## 5. Free→paid conversion benchmarks

- Classic freemium: **2–5%** of free users convert; cross-industry average **3.7%** (First Page Sage data; range 2.6% EdTech – 5.8% RegTech). Sources: https://userpilot.com/blog/freemium-to-premium/ ; https://www.withdaydream.com/library/insights/freemium-conversion-rate
- Opt-in free trials: **15–20%+** (https://www.amraandelma.com/free-trial-conversion-statistics/ ; https://www.appcues.com/blog/free-to-paid-conversion-strategies)
- Distribution: ~25% of freemium products convert <2.5%; ~29% land 2.5–7.5% (withdaydream, above).

Ledgerlift is **not classic freemium** — a user who downloads a 500MB company file, runs it through the tool, and sees a green reconciliation proof is closer to a completed trial with demonstrated value than a casual free user. Model the funnel in two stages:
1. Visitor → activated free user (uploads file, gets TB proof): 5–12% of relevant visitors (my estimate for a high-intent utility; UNVERIFIED)
2. Activated free user → paid: **8% conservative / 12% base / 18% upside** — bounded below by freemium averages and above by trial benchmarks, discounted for tire-kickers, unsupported file versions, and users satisfied with the free Intuit path.

---

## 6. Three 12-month scenarios (Jul 2026 → Jun 2027)

Shared assumptions: Paddle MoR (5%+$0.50); blended Pro price $120–140 (launch $99 for first ~2 months, then $149); Bookkeeper $499/10 files; refunds per §3; support per §4. Traffic is the dominant UNVERIFIED variable — a solo founder with no audience starts near zero SEO.

### Conservative
- Traffic: ramp 300→2,000 visits/mo, **~14,000 relevant visits/yr** (SEO from scratch; a few forum/Reddit hits)
- Activation 7% → ~1,000 free users; conversion 8% → **80 Pro sales** @ $120 blended = $9,600
- Bookkeeper: **4 packs** = $1,996 (no repurchases)
- Gross **$11,600** → MoR −$660, refunds (3%) −$350 → net revenue **≈ $10,600**
- Support: ~130 tickets ≈ $3,300 of founder time → **economic profit ≈ $7,300**
- Verdict: hobby income. Cause: traffic, not price or conversion.

### Base
- Traffic: ramp 800→5,500 visits/mo, **~36,000 visits/yr** (SEO on "QuickBooks Desktop price increase 2026", "QBD sunset", "export QuickBooks Desktop history"; the Feb 2026 price hike + per-employee fees are a live outrage tailwind — see Kemper/Brady Martz sources)
- Activation 10% → 3,600 free users; conversion 12% → **432 Pro sales** @ $135 blended = $58,320
- Bookkeeper: **15 packs** ($7,485), of which 5 firms repurchase a second pack (+$2,495). Compounding logic: a 10-file pack lasts a practicing bookkeeper ~2 quarters; happy firms repurchase and refer (repurchase rate 33% assumed, UNVERIFIED)
- Gross **$68,300** → MoR −$3,700, refunds (2%) −$1,370 → net **≈ $63,200**
- Support: ~620 tickets ≈ $15,500 founder time → **economic profit ≈ $47,700**
- Verdict: viable solo income; bookkeeper channel = 15% of revenue and growing into year 2.

### Upside
- Traffic: **~96,000 visits/yr** (avg 8,000/mo) — requires a viral moment: HN/Reddit front page on "your accounting history held hostage", press pickup of Feb-2026 hikes, ProAdvisor newsletter mentions
- Activation 12% → 11,500 free users; conversion 15% → ~1,700 potential, **capped at 1,400 Pro sales** (solo support ceiling) @ $140 = $196,000
- Bookkeeper: **60 packs** incl. repurchases = $29,940 — bookkeepers become the compounding channel (each firm = repeat buyer + referral node)
- Gross **$226,000** → MoR −$12,100, refunds (1%) −$2,260 → net **≈ $211,600**
- Support: ~1,600 tickets ≈ $40,000 → founder must add tooling/self-serve or contract help; **economic profit ≈ $170,000**
- Verdict: only reachable with a distribution event; support becomes the binding constraint before revenue does.

Sensitivity: revenue is ~linear in traffic and in stage-2 conversion; a ±50% error in either moves every scenario by the same factor. Price changes of ±$50 move revenue ~±30% with negligible effect on conversion at these value gaps (price is 8–13% of one year's QBD renewal).

---

## 7. Keep-or-change recommendation

**Pro $149: KEEP at launch, with a planned raise to $179–199 once testimonials exist.**
- The value anchor ($1,149–1,609/yr renewals, $399 nearest paid competitor, free competitor caps at 2 years and locks you into Intuit) supports $200+. $149 leaves money on the table but buys conversion-rate safety and impulse-purchasability while unproven.
- Do NOT go lower: flat costs (MoR $0.50 + ~$25 support/sale) make sub-$100 pricing structurally poor (§4).
- Launch $99: fine, but time-box it visibly (6–8 weeks) and label it "launch pricing" so the raise to $149 is pre-legitimized.
- Consider a history-depth upsell instead of a higher base: competitors charge $70–100/extra year (Dataswitcher, WOWBookSwitch), so "all history included" at $149 is itself the differentiator — market it that way rather than unbundling.

**Bookkeeper $499/10: CHANGE — raise to $599–699/10, or restructure as $499/5.**
- $49.90/file is a 66% discount off $149 for the *most* price-insensitive buyer: bookkeepers rebill migration to clients (professional conversions run £245+VAT at MoveMyBooks; US pros charge more) and often pocket $300–500/client per migration. A 10-pack at $699 ($70/file) still gives them ~80%+ margin on rebilling.
- The deep discount also cannibalizes: nothing technically stops a $149 Pro buyer processing many files client-side (see Red Flags), so the pack's job is legitimacy + volume convenience, not access — price it for that.

---

## RED FLAGS

1. **Free competitor funded by Intuit.** Dataswitcher/MoveMyBooks 2-year conversions are free (Intuit-subsidized) — the default escape path costs $0 and most owners will take it without ever searching further. Ledgerlift must win on "full history + leave Intuit entirely + offline forever," a message that needs distribution to work. (https://quickbooks.intuit.com/dataswitcher/ ; https://movemybooks.co.uk/free-conversions-courtesy-of-intuit-quickbooks-and-movemybooks/)
2. **Per-company-file licensing is unenforceable in a 100% client-side app.** No server = no license metering. A single Pro purchase can process unlimited files unless the license key is cryptographically bound to a file fingerprint (and even that is bypassable client-side). This quietly guts the Bookkeeper tier's rationale; treat multi-file compliance as honor-system and price accordingly.
3. **Traffic is the whole model.** Every scenario is linear in visits, and a solo founder starts at ~0 domain authority. Conservative and base differ only by distribution success — there is no verified benchmark behind the traffic numbers (marked UNVERIFIED throughout §6).
4. **Support is the hidden COGS.** Corrupt QBW files, ancient versions (QBD 2010…), 1GB+ files in a browser, payroll/inventory edge cases: at $25–38 per sale (§4), support is 3–5x the MoR fee. In the upside scenario support hours, not demand, cap revenue.
5. **Shrinking market with a bursty window.** Renewals-only since 2024 means the base only declines; the Feb-2026 price hike and per-employee fees create a spike of motivated switchers **now** — under-pricing during the peak (staying at $99 too long) wastes the best cohort. (https://www.kempercpa.com/news/upcoming-changes-to-quickbooks-desktop-pricing-effective-february-2026)
6. **QBW parsing scope risk → refunds.** TB reconciliation can pass while payroll detail, attachments, memos, or inventory assemblies don't transfer; undisclosed gaps convert to refunds/chargebacks ($20 each on Paddle). Publish an explicit "what transfers / what doesn't" table on the paywall.
7. **MoR platform risk.** Lemon Squeezy's post-Stripe-acquisition trajectory is uncertain (UNVERIFIED); Paddle approval for a brand-new solo seller handling financial-data software is not guaranteed and can take weeks — apply before launch, have the other as fallback.
8. **The $400–2,000 "conversion services" anchor from the brief could not be fully verified** — verified floor is $399 (WOWBookSwitch) and £245+VAT (MoveMyBooks professional); the $2,000 top end is plausible for bespoke CPA work but uncited. Don't use the unverified top end in marketing copy.
