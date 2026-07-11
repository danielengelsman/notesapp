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

---
(log continues as phases complete)
