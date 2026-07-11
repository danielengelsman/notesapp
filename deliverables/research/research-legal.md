> **Historical note:** this dossier was researched under the working name "Ledgerlift", later renamed **Bookstead** (see DECISIONS.md D-009). Facts verified as of July 11, 2026; the build sandbox blocks live re-fetching, so verify time-sensitive figures before external use.

# Ledgerlift — Legal & Positioning Risk Research
Date: 2026-07-11. Scope: naming "QuickBooks" in marketing of a client-side IIF/CSV conversion tool. **This is research, not legal advice.**

Method note: Intuit's own domains (intuit.com, developer.intuit.com, quickbooks.intuit.com) returned HTTP 403 to our fetcher; where Intuit-page language is quoted below it comes from search-engine excerpts of those pages and is flagged where the verbatim text could not be independently re-confirmed.

---

## 1. Nominative fair use — doctrine and cases

**New Kids on the Block v. News America Publishing, 971 F.2d 302 (9th Cir. 1992)** — the controlling three-part test for using another's mark to refer to *their* product:
1. The product is not readily identifiable without using the mark;
2. Only so much of the mark is used as reasonably necessary (word mark, not logo/stylization);
3. Nothing suggests sponsorship or endorsement by the mark holder.
Sources: https://cyber.harvard.edu/metaschool/fisher/domain/tmcases/newkids.htm ; https://en.wikipedia.org/wiki/Nominative_use ; https://harriganip.com/blog/nominative-fair-use-trademark-law/

**Smith v. Chanel, Inc., 402 F.2d 562 (9th Cir. 1968)** — "in the absence of misrepresentation or confusion as to source or sponsorship a seller in promoting his own goods may use the trademark of another to identify the latter's goods." Truthful reference to a competitor's product (even to sell against it) is lawful.
Sources: https://law.justia.com/cases/federal/appellate-courts/F2/402/562/446662/ ; https://www.quimbee.com/cases/smith-v-chanel-inc

**Toyota Motor Sales v. Tabari, 610 F.3d 1171 (9th Cir. 2010)** — nominative fair use can extend even to *domain names* containing another's mark (buy-a-lexus.com), and the mark holder bears the burden of showing the use is not nominative. But the court distinguished domains like `trademark.com` or `buy-trademark.com` that suggest official sponsorship — those remain risky.
Sources: https://cdn.ca9.uscourts.gov/datastore/opinions/2010/07/08/07-55344.pdf ; https://jolt.law.harvard.edu/digest/toyota-motor-sales-v-tabari ; https://blog.ericgoldman.org/archives/2010/07/funky_ninth_cir.htm

Circuit caveat: the Second Circuit treats nominative fair use as factors inside the confusion analysis rather than a standalone defense (Int'l Info. Sys. Sec. Cert. Consortium v. Security Univ., 2d Cir. 2016) — outcome-similar but less predictable outside the Ninth Circuit. Source: https://www.arnoldporter.com/en/perspectives/publications/2016/11/2016_11_16_second_circuit_expands_split__13324

**Application:** A migration tool literally cannot describe itself without saying "QuickBooks" (prong 1 satisfied). Use the plain word mark only, never the logo or green trade dress (prong 2), and add a no-affiliation disclaimer (prong 3).

## 2. Intuit's published trademark guidelines

Intuit maintains a public trademark policy at **https://www.intuit.com/legal/trademark/** (page 403'd to our fetcher; language below from search excerpts of that page — verbatim wording UNVERIFIED but consistent across multiple retrievals):
- **Compatibility statements are expressly sanctioned without a license**: uses that are factually "for use with," "designed to work with," or "compatible with" an Intuit product are listed as examples where use of Intuit marks "may be appropriate without an express license." This is the single most important finding: Intuit's own policy blesses the exact phrasing Ledgerlift needs.
- Referential use should carry the ® symbol at first mention plus attribution: **"Intuit and QuickBooks are registered trademarks of Intuit Inc."** (US/Canada wording).
- Prohibited without written license: Intuit/QuickBooks **logos**, trade dress, designs; use of marks **within product names, business names, or domain names**; anything creating an impression of endorsement, sponsorship, or association.
- Permission requests beyond that: https://www.intuit.com/legal/permissions/

Intuit developer-program marketing rules (for QuickBooks App Store apps; Ledgerlift is not one, but they signal Intuit's enforcement posture):
- Apps must not use "QuickBooks," "QB," or "Intuit" as the **primary element** of a name or ad; the sanctioned pattern is "**XYZ Company – Application for QuickBooks**." Don't abbreviate to "QB"/"QBO."
- Sources: https://developer.intuit.com/app/developer/qbo/docs/go-live/list-on-the-app-store/naming-and-logo-guidelines ; https://developer.intuit.com/app/developer/qbo/docs/go-live/market-your-app/search-engine-marketing-and-advertising-guidelines (both 403'd directly; content via search excerpts — UNVERIFIED verbatim)
- Co-branding design rules for partners: https://digitalasset.intuit.com/render/content/dam/intuit/sa/en_us/quickbooks/brand-design-guidelines/quickbooks-brand-partners-design-guidelines.pdf

## 3. ToS/EULA — the user's right to their own data

QuickBooks Desktop EULA (2024): https://www.intuit.com/legal/terms/en-us/quickbooks/desktop-payroll-2024/ (403'd; excerpts via search — clause-level wording UNVERIFIED):
- Software is **licensed, not sold**; license is personal, limited, revocable.
- After subscription termination the user **"retain[s] access to your company data file stored on your device,"** though restoring it to a *readable QuickBooks format* requires reactivation or a new license. I.e., Intuit's own terms treat the data file as remaining with the user.
- "Data Transfer" is defined as transferring/sharing, **"upon your authorization,"** your Software data with Applications — user-authorized export to third-party tools is a contemplated activity.
- EULA index pages: https://quickbooks.intuit.com/learn-support/en-us/help-article/license-information/quickbooks-desktop-software-license-agreement-eula/L7lE2FMk4_US_en_US ; older 2018 EULA: https://quickbooks.intuit.com/software-licenses/qb2018_and_intuit_payroll_services_eula/

Key structural point: **Ledgerlift never runs against QuickBooks, its APIs, or the .QBW file.** It consumes files (IIF, report CSVs) that the *user* exported using QuickBooks' own built-in, documented export features. The EULA binds the QuickBooks user, not Ledgerlift; and exporting via the product's own menus is plainly licensed use. Standard EULA prohibitions (reverse engineering *the Software*) are not implicated by parsing a user's exported text files. UNVERIFIED: whether any current EULA clause restricts downstream use of exported files — none surfaced in research, and the "Data Transfer upon your authorization" language cuts the other way.

## 4. Is IIF publicly documented by Intuit? — YES

- **"Export, import, and edit IIF files"** (official): https://quickbooks.intuit.com/learn-support/en-us/help-article/import-export-data-files/export-import-edit-iif-files/L56LT9Z0Q_US_en_US — describes .IIF as ASCII tab-separated files QuickBooks Desktop uses to import/export lists and transactions.
- **"IIF Overview: import kit, sample files, and headers"** (official): https://quickbooks.intuit.com/learn-support/en-us/help-article/list-management/iif-overview-import-kit-sample-files-headers/L5CZIpJne_US_en_US — Intuit distributes an IIF Import Kit (manual PDF, header reference, example files).
- **"Improved IIF Import in QuickBooks 2019 and later"** (official): https://quickbooks.intuit.com/learn-support/en-us/help-article/import-export-data-files/improved-iif-import-quickbooks-2019-later/L1K3ZQDX9_US_en_US
- **Product-accuracy nuance:** Intuit's help pages state you can *import* transactions via IIF but **cannot export transactions** from QuickBooks via IIF (lists export; transaction history typically comes out via report exports instead). Ledgerlift's architecture (IIF **plus report CSVs**) matches reality — marketing must not claim "export your full ledger as IIF," which QuickBooks can't do. Source: the L56LT9Z0Q article above.

So: parsing IIF is parsing an openly documented interchange format — no trade-secret or DMCA-circumvention angle. UNVERIFIED: no copyright claim by Intuit over user-created IIF data files was found (data the user exports is the user's business records).

## 5. Precedents — Intuit vs. compatible/third-party tools

- **No published trademark or contract lawsuit by Intuit against a QuickBooks-compatible converter/importer was found** in searches of case reporters, legal news, and Intuit litigation dockets (https://companyprofiles.justia.com/company/intuit/dockets/case). Intuit's visible IP litigation is defensive (e.g., Samesurf patent suit against Intuit: https://www.mckoolsmith.com/newsroom-pressreleases-336). **UNVERIFIED as absence of evidence** — private C&D letters would not surface publicly.
- **Where Intuit does enforce: domains.** Intuit routinely wins UDRP transfers of confusing domains (e.g., turbotaxintuit.com, WIPO D2009-1439: https://www.wipo.int/amc/en/domains/decisions/html/2009/d2009-1439.html ; typo-domains D2020-1513/1514: https://www.wipo.int/amc/en/domains/decisions/text/2020/d2020-1513.html). Do not put "quickbooks"/"intuit" in the domain.
- **Tolerance evidence is strong.** A mature third-party conversion/import ecosystem has operated openly for 15+ years: Zed Axis (https://www.zed-systems.com/ — "import ... from text, IIF or Excel ... into your QuickBooks desktop," 27,000+ users, and **listed on Intuit's own app store**: https://quickbooks.intuit.com/app/apps/appdetails/zed_axis_import_qbo/en-us/), MoneyThumb (https://www.moneythumb.com/quickbooks-converters-benefits-o/), MMC Convert (https://www.mmcconvert.com/blog/how-to-import-a-quickbooks-iif-file-everything-you-need-to-know/), Dancing Numbers (https://www.dancingnumbers.com/intuit-interchange-format-iif/). These openly use "QuickBooks" nominatively in marketing.
- **Market context:** Intuit stopped selling new QuickBooks Desktop Pro/Premier/Mac Plus subscriptions Sept 30, 2024; Desktop 2024 support ends Sept 30, 2027 (https://www.sdocpa.com/quickbooks-desktop-discontinued/ ; https://www.method.me/blog/quickbooks-desktop-discontinued/). A whole cottage industry markets "QuickBooks Desktop migration" — Ledgerlift is not an outlier. Friction point: Intuit wants those users on QBO/Enterprise; a tool exporting them to *other* ledgers competes with Intuit's preferred path, but competing truthfully is exactly what Smith v. Chanel protects.

## 6. Standard disclaimers (financial-adjacent software)

Canonical formulation (used across the industry): *"This material has been prepared for informational purposes only, and is not intended to provide, and should not be relied on for, tax, legal or accounting advice. You should consult your own tax, legal and accounting advisors before engaging in any transaction."*
Sources: https://www.jpmorgan.com/disclosures/taxlegaldisclaimer ; https://www.benicompselect.com/tax-and-legal-advice-disclaimer

Recommended disclaimer set for Ledgerlift (standard practice; assemble with counsel):
1. **No professional advice:** "Ledgerlift is a data-conversion utility. It does not provide tax, legal, or accounting advice. Consult your own advisors."
2. **No affiliation:** "Ledgerlift is an independent product. It is not affiliated with, endorsed by, or sponsored by Intuit Inc. Intuit and QuickBooks are registered trademarks of Intuit Inc." (attribution wording per Intuit's own trademark page, §2 above).
3. **Accuracy/verification:** "Converted output should be reviewed and reconciled by you or your accountant before relying on it." Plus standard "as-is / no warranty" terms in the ToS (UCC §2-316-style conspicuous disclaimer — standard commercial practice; verify final language with counsel).
4. **User authority:** "Only convert data you own or are authorized to access."

## 7. Making "your data never leaves your browser" verifiable and safe

**Regulatory stake:** FTC v. Zoom (2020) — misrepresenting security/privacy properties ("end-to-end encryption" that wasn't) is an FTC Act §5 deceptive practice; the consent order bars misrepresentations about privacy/security and how data is collected/disclosed. Any "never leaves your browser" claim must be *literally and completely true* — a single analytics beacon, crash reporter, CDN font fetch, or error-logging call containing file data falsifies it.
Sources: https://www.ftc.gov/news-events/news/press-releases/2020/11/ftc-requires-zoom-enhance-its-security-practices-part-settlement ; https://www.ftc.gov/business-guidance/blog/2020/11/zooming-zooms-unfair-deceptive-security-practices-more-about-ftc-settlement

**Technical enforcement (turn the promise into a browser-enforced property):**
- Serve with CSP **`connect-src 'none'`** (blocks XHR/fetch/WebSocket/EventSource after page load) — "an enforcement, not a promise." Sources: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/connect-src ; worked example (JWT debugger marketing exactly this way): https://dev.to/sendotltd/a-jwt-debugger-that-never-sends-your-token-anywhere-5egj ; CSP overview: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP
- Also lock `form-action`, `img-src`, `font-src`, `frame-src` to 'self'/'none' (data can exfiltrate via image URLs and form posts, not just fetch); self-host every asset, zero third-party scripts.
- **Works-offline demo:** instruct users to load the page, disconnect the network (or watch DevTools Network tab), then convert — the strongest lay-verifiable proof. Offer a downloadable single-file build.
- **Open source + verifiability:** publish the source; use Subresource Integrity hashes (https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Subresource_Integrity) and a reproducible build so third parties can confirm the deployed bundle matches the repo (https://dev.to/havenmessenger/reproducible-builds-the-only-way-to-verify-your-software-wasnt-tampered-with-31h ; https://nocomplexity.com/documents/securityarchitecture/prevention/reproduciblebuilds.html). Note: reproducible builds alone don't prove *every visitor* got the audited bundle — binary/asset transparency or a signed downloadable release closes that gap (same sources).
- **Claim hygiene:** if any telemetry exists, scope the claim ("your financial files are processed entirely in your browser and are never uploaded; the site loads static assets and anonymous page analytics from X") rather than absolute language.

---

# RISK REGISTER

| # | Risk | Severity | Likelihood | Mitigation |
|---|------|----------|------------|------------|
| R1 | Trademark infringement claim for referencing "QuickBooks" in marketing/SEO | High if mishandled; low as mitigated | Low — Intuit's own policy permits compatibility statements; large tolerated ecosystem (§2, §5) | Word mark only, ® at first use, attribution line, no-affiliation disclaimer, never lead with "QuickBooks" as the primary brand element ("Ledgerlift — converts QuickBooks Desktop exports," not "QuickBooks Converter") |
| R2 | Using "quickbooks"/"qb"/"intuit" in domain, product name, company name, app-store handle, or logo/green trade dress | High | High that Intuit acts (proven UDRP enforcement, §5) | Keep marks out of domain and product name entirely; Tabari gives some domain defense but Intuit's UDRP track record makes it not worth it |
| R3 | Implied endorsement (badges like "QuickBooks Certified," Intuit-style visuals, "official") | High | Medium if design drifts | Prong-3 discipline: visible "not affiliated with Intuit Inc." on site footer, pricing, and ads; never use Intuit logos/colors/screenshots of QB branding beyond factual UI shots with attribution |
| R4 | EULA-based claim that conversion breaches QuickBooks terms | Medium | Very low — tool only reads user-exported files; EULA contemplates user-authorized data transfer and post-termination data retention (§3) | Architecture stays file-based (no QBW parsing, no API scraping, no automation of the QB binary); document that users export via QuickBooks' own menus; UNVERIFIED clause-level EULA text → have counsel read the current EULA verbatim |
| R5 | Overclaiming capability ("export everything as IIF") — false advertising / Lanham Act §43(a) exposure and refund demands | Medium | Medium — IIF cannot export transactions from QB (§4) | Describe inputs precisely: "converts the IIF list exports and report CSVs QuickBooks Desktop produces"; publish a supported-data matrix |
| R6 | "Data never leaves your browser" claim falsified by analytics/CDN/error-reporting → FTC §5 deception (Zoom precedent) | High | Medium by accident | CSP `connect-src 'none'` + self-hosted assets + zero third-party scripts; offline demo; open source + SRI + reproducible builds; scope the claim if any telemetry exists (§7) |
| R7 | Being read as giving accounting/tax advice (migration mapping choices affect books) | Medium | Medium | "Not tax, legal, or accounting advice" disclaimer (§6); frame mapping suggestions as defaults to be reviewed by the user's accountant; require user confirmation of chart-of-account mappings |
| R8 | Data-accuracy liability (bad conversion corrupts someone's books) | Medium-High | Medium | Conspicuous as-is/no-warranty terms, reconciliation checklist in output (trial-balance comparison report), keep originals untouched (read-only by design — client-side helps here), liability cap in ToS |
| R9 | Private C&D from Intuit despite compliance (no public precedent found, but unverifiable) | Medium | Low | Keep a nominative-fair-use memo on file; comply with Intuit's published guidelines to the letter so any C&D is answerable by pointing at intuit.com/legal/trademark; carry the attribution line everywhere |
| R10 | SEO tactics crossing the line (bidding on "QuickBooks" keywords is generally lawful nominative use; ad *copy* leading with the mark is what Intuit's guidelines prohibit) | Low-Medium | Medium | Ad headlines lead with Ledgerlift; mark appears descriptively in body ("for QuickBooks Desktop exports"); no "QB" abbreviation |

## SAFE MARKETING LANGUAGE PATTERNS

**Safe (matches Intuit's own sanctioned examples + nominative fair use):**
- "Ledgerlift works with QuickBooks® Desktop exports"
- "Converts from QuickBooks Desktop (IIF and report CSV files)"
- "Compatible with QuickBooks Desktop 2019–2024" / "designed to work with QuickBooks Desktop"
- "Ledgerlift — an independent migration tool for QuickBooks Desktop users"
- Footer: "Intuit and QuickBooks are registered trademarks of Intuit Inc. Ledgerlift is not affiliated with, endorsed by, or sponsored by Intuit Inc."
- Privacy: "Your files are processed entirely in your browser. The app makes no network requests after loading — enforced by our Content-Security-Policy and verifiable in your browser's developer tools. Source code available."

**Risky / avoid:**
- "QuickBooks Converter" as the product name; "quickbooks" or "qb" in the domain; "QB"/"QBO" abbreviations
- Intuit/QuickBooks logos, green trade dress, look-alike UI
- "The official way to leave QuickBooks," "QuickBooks-approved," "certified," partner badges you don't hold
- Ads where "QuickBooks" is the headline/primary element
- "Export your entire QuickBooks ledger as IIF" (factually wrong)
- Absolute "we never see your data" if any script, font, image, or beacon loads from a third party

# RED FLAGS
1. **Intuit legal pages could not be fetched directly (403)** — all quoted Intuit guideline/EULA language is from search excerpts and is flagged UNVERIFIED verbatim. Before launch, a human must pull https://www.intuit.com/legal/trademark/ and the current Desktop EULA and confirm exact wording.
2. **Intuit demonstrably enforces against domains** (multiple WIPO UDRP wins). Any "quickbooks" string in Ledgerlift's domain is the single most likely trigger of real enforcement.
3. **The privacy claim is the highest regulatory-exposure item**: FTC's Zoom order shows privacy/security misstatements draw 20-year consent decrees. Ship CSP enforcement and audit every asset load *before* the claim goes on the homepage.
4. **IIF cannot export transactions from QuickBooks** — marketing that implies full-ledger IIF export would be false advertising and a support disaster; the report-CSV pathway must be described accurately.
5. **No public precedent either way on Intuit vs. converters** — the tolerance evidence (Zed Axis on Intuit's own app store, 15-year converter ecosystem) is strong but informal; private C&Ds are invisible. UNVERIFIED as a guarantee of tolerance.
6. **Circuit split on nominative fair use** (2d Cir. treats it differently) — safe phrasing patterns above are robust in any circuit, but bespoke aggressive uses (e.g., mark-in-domain per Tabari) rely on Ninth Circuit law and shouldn't be assumed portable.
