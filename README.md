# Bookstead — Your books, yours again.

A complete company built from scratch in one autonomous AI run: research → business
design → brand → working product → marketing site → launch & founder videos →
red-team review → this package.

**The product:** Bookstead evacuates QuickBooks® Desktop history into (1) a permanent,
self-contained offline archive the owner keeps forever and (2) migration packs for
GnuCash, Manager.io, and generic CSV/JSON — with a trial-balance reconciliation that
proves the conversion penny-perfect *before* the user pays. Everything runs client-side:
the books never leave the browser.

## Start here

**`deliverables/RECAP.html`** — open it in a browser. It tells the whole story:
the business, the evidence, the videos, and how to demo everything below.

## Run the site + product

Requires Node 20+ (built on Node 22).

```bash
npm install
npm run fixtures     # regenerates the sample company + demo data (deterministic)
npm test             # 26 engine tests incl. penny-perfect reconciliation
npm run build        # static export to out/
npx serve out        # → http://localhost:3000
```

Then:
1. Open the site, click **Open Bookstead** (or go to `/app/`).
2. Click **Try the sample company** → **Run the free check** → watch the
   reconciliation verify 1,369 transactions to the penny.
3. Download the **archive** (one self-contained .html — open it, search it, print
   reports from it, offline) and the **migration pack** (.zip).
4. To test the license flow with your own files: mint a key with
   `npx tsx scripts/make-license.ts you@example.com` (or use the one in
   `deliverables/DEMO_LICENSE.txt`) and paste it into the app.

`npm run dev` works too (dev server on :3000).

## The deliverables

| Path | What it is |
|---|---|
| `deliverables/RECAP.html` | The recap — open this first |
| `deliverables/BUSINESS_PLAN.md` | Full plan: problem, wedge, market, pricing, GTM, risks (sources inline) |
| `deliverables/DECISIONS.md` | Every decision of the run, with rationale |
| `deliverables/BRAND.md` | Brand book: name, logo, palette, voice |
| `deliverables/videos/bookstead-launch.mp4` | 72s launch video (motion graphics + real product footage, neural VO) |
| `deliverables/videos/bookstead-founder.mp4` | 78s founder video — the founder is the AI that built this |
| `deliverables/research/` | Primary research: 12-angle pain hunt, tournament, 7 specialist dossiers, fact-check, red team, QA attack |
| `src/engine/` | The conversion engine (parsers, ledger rebuild, reconciliation, archive & export generators) + tests |
| `fixtures/blue-heron/` | Deterministic sample company (6 years, 1,369 transactions) with QBD-style exports |

## Honest notes

- Built under a "no paid APIs, publish nothing, spend nothing" constraint — which
  became the product's core feature: local-first by architecture.
- The license signing key is committed **deliberately** (this repo is the demo
  deliverable); in production it lives only in the checkout webhook.
- v1 scope, exclusions, and every public claim's verification status are documented
  in `deliverables/research/fact-check.md`.

Intuit and QuickBooks are registered trademarks of Intuit Inc. Bookstead is an
independent product, not affiliated with or endorsed by Intuit Inc.
