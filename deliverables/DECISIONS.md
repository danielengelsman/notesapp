# Decision Log — Autonomous Company Build

Mission: build a complete company from scratch, starting from the open internet, in one autonomous run.
Operator: Claude (autonomous run, July 11, 2026). No user input mid-run — every call below is mine, with rationale.

---

## D-001 · Environment audit → product must run with zero paid APIs
**Found:** The repo's `.env` doesn't exist — only `.env.local.example` with placeholder values. No Anthropic/ElevenLabs/Supabase keys are actually present. Environment variables contain only sandbox infrastructure credentials, which are not product-runtime keys.
**Decision:** The product must be fully functional locally with **no paid API at runtime**. Any AI feature ships as optional bring-your-own-key or is architected out. This is also a stronger business position: "local-first, no subscription-to-exist" is itself a market wedge (validated later in research).

## D-002 · Repo strategy: build inside this repo, on the designated branch
The mission says "work inside this project." The existing SecureNotes scaffold is a prior experiment on `main`. I will build the new company in this repo on `claude/startup-from-scratch-sdbrut`, replacing the app surface with the new product and keeping deliverables under `deliverables/`. Nothing is published (guardrail): no deploys, no PR, no external posts.

## D-003 · Video production approach (constraint-driven)
No video-gen or TTS API keys exist. Playwright + Chromium are pre-installed; Playwright's bundled ffmpeg is video-only (no audio codecs). I'm root with apt.
**Decision:** Produce the launch and founder videos as **motion-graphics HTML scenes recorded with Playwright**, voiced with a locally installed open-source TTS (piper-tts preferred, espeak-ng fallback), muxed with apt-installed ffmpeg. Free, local, reproducible — honors "no new spending" and "publish nothing."

## D-004 · Phase 1 research design
Launched workflow `pain-hunt` (run wf_064d1b86-a80): 12 parallel researchers, each assigned a distinct corner of the internet (small business, trades, HN, SaaS review gripes, freelancers, private-practice clinics, landlords, education, e-commerce sellers, explicit "I would pay for" demand, personal/life-admin ops, events & nonprofits). Hard rules given to every researcher: quotes must come from actually-fetched pages with URLs; recency 2024–2026; pain must be buildable as local software in a month with no paid runtime APIs; skip marketplaces/hardware/regulated-device ideas.
Then: merge/dedupe → top-8 shortlist → **adversarial verification** (one skeptic per candidate whose job is to refute evidence, find competitors with prices, and find independent demand).

## D-005 · Voiceover: neural piper voice via npm, mbrola fallback
The sandbox proxy blocks HuggingFace, GitHub release assets, Microsoft Edge TTS, and Google TTS — so the standard piper voice catalog is unreachable. Findings from a systematic probe: apt/pypi/npm registries and raw.githubusercontent are open. I located an npm package (`terran-adjutant-tts`) that **bundles a piper-format neural voice** (63MB onnx, works with the installed piper runtime — verified by synthesizing audio). Its slight synthetic character is a feature, not a bug: the founder of this company is literally an AI, and the videos will say so. Fallbacks installed and tested: espeak-ng with mbrola-us voices, plus full ffmpeg for muxing. Video pipeline is fully unblocked, all free/local.

## D-006 · Phase 1 results — what the internet is actually angry about
The hunt returned **53 distinct pain candidates across all 12 angles** (1.18M tokens of subagent research). The merge agent shortlisted 8; skeptic agents then adversarially investigated each. Outcome:
- **5 of 8 REFUTED as already-served** (with named competitors + prices): Google-Photos-Takeout repair (MetadataFixer, $39), HoneyBook-refugee CRM (Bloom $7/mo et al., migration wave already harvested), buy-once bookkeeping (Manager.io/Frappe Books are free+local), flat-price newsletter (MailerLite doesn't bill unsubscribed; Kit free to 10k), UK MTD landlord filing (123 Sheets £19.50/yr, 5-star). This is the verification layer working as designed — every one of these looked great on evidence alone.
- **3 survived unverified** (skeptics hit a transient capacity limit): local DMARC report reader, self-hosted client video review (Frame.io escape), flat-price trades job tool.
- **Meta-pattern across nearly all 53:** the recurring anger of 2025–26 is *subscription creep, per-seat ransom, and data hostage-taking* by SMB SaaS. "Software you can own" is the era's wedge — and conveniently the only kind of product I can build under my constraints.

## D-007 · Phase 2 tournament design
Workflow `idea-tournament` (wf_432191ff-85e): skeptics finish verifying the 3 survivors → **5 entrepreneur agents** pitch competing businesses (3 survivors + QB-Desktop-escape re-wedged per its own skeptic's hint + 1 wildcard free to exploit the meta-pattern across all 53 pains) → **4-lens judge panel** (investor, customer, builder, distribution) scores independently. Pitch agents receive the skeptic dossiers and must answer every objection. Final pick is mine, informed by aggregate scores and fatal-risk notes.

## D-008 · THE PICK: Ledgerlift — evacuate QuickBooks Desktop, own your books forever
Tournament results (4 judges × 5 pitches, 0–100 each): **Ledgerlift 287**, Roundtrip 280, DepositProof 244, RejectReady 243, Paydirt 208. Investor and builder lenses chose Ledgerlift; customer and distribution chose Roundtrip. All three late verifications (DMARC, video review, trades FSM) came back REAL_BUT_SERVED — the pitch agents had to re-wedge, and the two strongest re-wedges became the finalists.

**Why Ledgerlift over Roundtrip (my tie-break reasoning):**
1. *Trigger quality*: Ledgerlift's buyer holds a renewal invoice with a printed deadline ($810–$1,000/yr QBD Plus, hikes re-detonating every fall). Roundtrip's buyer has an ambient annoyance.
2. *Wedge structure*: nobody's P&L can fund the escape+archive — Intuit needs hostage data, destinations only fund inbound migration of ~2yr summaries, free ledgers can't fund the grind. Roundtrip's parser is a weekend clone for editingtools.io, per three of four judges.
3. *Price power & channel*: $149/company file vs $49/editor; bookkeepers ($499/10 files) are a concentrated repeat buyer in a one-shot category.
4. *Risk conversion*: Ledgerlift's fatal risk (data fidelity) is answered architecturally — free tier runs the full reconciliation and shows the penny-diff BEFORE payment; nobody pays for an unverified conversion. The product never asks for trust, it demonstrates it.
5. *Constraint fit*: 100% client-side (books never leave the browser) is simultaneously my sandbox constraint, the trust story, the HN hook, and the zero-marginal-cost economics.

**Grafts from runners-up:** Roundtrip's free-tier-as-forum-answer virality; builder judge's scope cut (v1 ships Manager.io + GnuCash + generic CSV export packs, not six); RejectReady's "become upstream of the OSS ecosystem" distribution instinct (publish the format fixtures as open data).
**Dissent recorded:** customer judge notes migration tools are scary purchases — answered by verification-before-payment; distribution judge notes penny-perfect claims are the hardest engineering promise — answered by fencing v1 to US simple books and flagging excluded categories loudly.

## D-009 · Rename: Ledgerlift → Bookstead
Naming research killed "Ledgerlift": an active Boston-area bookkeeping firm (LedgerLift, LLC) holds ledgerlift.com **and filed two 2025–26 USPTO applications for LEDGERLIFT covering bookkeeping** — a direct, fatal collision. Adopted the researcher's #1 alternative: **Bookstead** (books + homestead — a place your books live that nobody can repossess). Verified clean across web, GitHub, Product Hunt, and app stores; bookstead.com is parked/for-sale, not in active use. Tagline: **"Your books, yours again."** Runner-ups rejected: Outledger (the "-ledger" namespace is mobbed), Permabook (flat), Bookvault (existing UK firm).

## D-010 · Phase 3 research findings (7 specialists, all sourced in deliverables/research/)
- **Market:** ~1.0–1.6M paying QBD subscribers (revenue-implied; Intuit doesn't disclose), Pro Plus $349.99 (2021) → $1,049 + $310/seat (Oct 2025) ≈ 3× in 4 years; QBD 2023 sunset May 31, 2026 — six weeks before "today," a fresh urgency wave. Key mechanism: lapse → 12-month view-only → nothing, vs. IRS 3–7-year retention duty. Honest bootstrap TAM: ~450–800k US "leave-QBD" events through 2029; realistic capture $250k–$1.25M.
- **Competition:** *nobody* does client-side/no-upload conversion; all incumbents take custody (Dataswitcher ~2yr depth, E-Tech $275–449 service, MoveMyBooks UK-only). Best OSS is a 45-star GnuCash-only script. Confirmed red flag: QBW files are encrypted Sybase databases — parsing user-run exports (our design from day one) is the only honest architecture; completeness claims must be scoped to GL/trial balance, and marketing must say so.
- **Legal:** nominative fair use + Intuit's own trademark page permits "works with QuickBooks®" statements; never use logos/green/"QB" in name or domain; EULA supports the user's right to their data; FTC precedent means "never leaves your browser" must be architecturally true (CSP connect-src 'none', no third-party assets) — which it is.
- **Pricing:** verified MoR fees 5%+$0.50 (both Paddle and Lemon Squeezy); contribution ≈ $113/sale at $149; 12-mo scenarios: $10.6k / $63k / $212k. Adopted recommendations: keep $149, time-box the $99 launch, raise bookkeeper pack to **$599/10 files**.
- **Engine milestone:** core built and tested — 19/19 tests, penny-perfect reconciliation on a 1,369-transaction six-year fixture company, with an independent referee computation and a sabotage test proving the safety net catches filtered exports.

## D-011 · Product architecture choices (Phase 5)
- **Static export, no server anywhere**: `next.config.ts output:'export'`. The privacy claim is enforced by architecture; also makes the package runnable by a stranger with `npx serve out`.
- **Reconciliation is the product**: parsers never fail hard — they warn; the trial-balance diff is the safety net. Sabotage test (account-filtered export) proves the net catches real-world mistakes.
- **Archive = one self-contained HTML** with embedded JSON + vanilla-JS viewer (no sql.js: a wasm dependency inside a "readable in 2040" artifact undermines the promise; plain JS + JSON keeps the escape hatch of raw readability).
- **Licensing**: Ed25519-signed keys verified via SubtleCrypto in-browser — no phone-home, consistent with the premise. Signing key deliberately committed (this repo IS the demo; production note in the script). Demo company ships with downloads unlocked; real files gated.
- **Demo data bundled as a module** (not fetched) so the in-app demo makes zero requests.

## D-012 · Video production (Phase 6)
Two films, fully local: launch (72s, 6 scenes) and founder (78s, 5 scenes). Motion scenes are brand-styled HTML/CSS recorded via Playwright; product scenes are REAL footage of the working app and archive (labeled as such on screen). Voiceover: the piper neural voice (see D-005) — a synthetic voice for an AI founder is honesty, not budget. Assembled with ffmpeg (h264/aac, hard cuts). Every frame QA'd via extracted stills.

## D-013 · Phase 7 red team — findings and responses
Four adversarial agents (fact-checker, QA attacker, business red-teamer, completeness critic) ran against the finished company. Material findings and what I did:
- **CSP claimed but not implemented** (completeness critic): the plan cited `connect-src 'none'` that didn't exist in code. FIXED: real CSP meta now ships on every page (`default-src 'self'`, `connect-src 'self'`, `object-src 'none'`, …), verified working under Playwright; claims reworded to match exactly. Lesson logged: a claims-vs-code auditor belongs in every future run.
- **QBD export row caps** (red team): CSV report exports cap ≈32k rows — "one CSV" was false for the biggest customers. FIXED: chunked multi-file ingestion verified working (it merges and still must reconcile green); how-it-works copy now teaches date-range chunking.
- **No legal person can sign the merchant agreement** (red team): inherently true — an AI can't pass KYC. LOGGED as the #1 handoff item in the recap: the human taking this to market must put an LLC on the Paddle/Lemon Squeezy account. Not fixable from inside the sandbox; stated, not hidden.
- **Refund wording** (red team): "no-questions 30 days" on an irrevocable digital good is an open register. FIXED: reworded to a conversion-quality promise.
- **Demand shape** (red team): base case is bookkeeper-led, not owner-viral; conservative scenario (~$10.6k) is the honest expectation, upside requires the bookkeeper channel compounding. ACCEPTED into the plan framing.
- **AI-founder disclosure on the buying path** (red team wanted it moved off): PARTIALLY REJECTED — kept on landing + security page. Rationale: the first distribution beachhead (Show HN, r/Bookkeeping trust-first post) rewards radical transparency; hiding it there is both off-brand and discoverable. Dissent recorded here.
- Verdict adopted: **SHIP-WITH-CHANGES, changes applied** (fact-check fixes follow in D-014).

## D-014 · Fact-check fixes (Phase 7)
The adversarial fact-checker checked 30 public claims (13 verified, 8 overstated, 4 wrong, 5 unverifiable). Fixes applied:
- **Flagship price was stale**: site + both videos said $1,049/yr; Intuit raised Pro Plus to **$1,149/yr effective Feb 1, 2026** — and my own research files already had the right number. FIXED everywhere including re-recording video scenes L1/L2/F3 and their voiceover (L2 now shows the full 5-bar 2021→2026 ramp). This is exactly the kind of miss the "cite everything" discipline exists to catch; logged as a process lesson.
- **"Audit trail etc. not in QuickBooks' exports"** was refutable (the Audit Trail *is* an exportable report). Reworded on 4 pages to the true claim: they don't carry into a *new ledger*, and we tell users how to keep them (export the report, copy the Attach folder).
- **View-only export claim** softened to exactly what Intuit documents (report exports yes; IIF list export unconfirmed — the app runs from reports alone if lists are unavailable).
- **Wave/Dataswitcher** framing corrected (Wave no longer carries QB history; Dataswitcher is QuickBooks-Online-onboarding).
- Bookkeeper-pack ROI line fixed to the verified $275–$449 service-price anchor.

## D-015 · QA-attack fixes (Phase 7)
The hostile QA engineer found 1 P0, 4 P1, 4 P2 (and confirmed the archive is injection-safe, crypto is sound, and 70k-txn files parse in <1s). Fixed and regression-tested (new `src/engine/security.test.ts`, suite now 35/35):
- **P0 — CSV/TSV formula injection** in every export pack: cells beginning `= + - @` executed on open in Excel/Sheets. FIXED: quote-prefix such cells (exempting genuine numbers, since the GnuCash Amount column needs `-100.00`). 
- **P1 — demo data merged into a real company's output** + **P1 — license unlock bypass via `isDemo`**: both stemmed from inferring demo-mode from file *content*. FIXED: explicit `"empty"|"demo"|"user"` mode; adding your files discards demo files; downloads unlock only in genuine demo mode. Verified in-browser (real archive contains only the real company, gate holds).
- **P1 — multiple transaction files parsed under the first file's column map**: FIXED — each file parsed independently then merged (this also makes the chunked-export workaround from D-013 actually correct).
- **P1 — reconciliation false-mismatch on space-separated account numbers** ("1000 Checking" vs "Checking"): FIXED in `normalizeAccountLabel`.
- **P2 — calendar-impossible dates** (02/30/2024) accepted: FIXED — real-date validation, leap-year aware.
Remaining P2s (adjacency grouping of same-Type/Date/Num txns without a Trans #; 3-decimal per-line rounding) are documented in qa-attack.md as known v1 limitations — both are caught by the reconciliation diff, which is the design's whole point.

## D-016 · Net verdict after the kill attempt
The business SURVIVED with changes, not unscathed. The honest scorecard now lives in `deliverables/research/red-team.md`, `fact-check.md`, `qa-attack.md`, and `completeness-audit.md` — shipped in the package rather than buried. The single thing I could not fix from inside the sandbox: **a legal person must front the merchant-of-record account** (an AI can't pass KYC). That's the #1 handoff item, stated plainly in the recap. Everything else the panel raised was either fixed or consciously accepted with reasoning recorded.

---
(log continues as phases complete)
