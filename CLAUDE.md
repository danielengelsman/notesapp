# CLAUDE.md — SecureNotes AI


## Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.

## Project Overview
A personal AI-powered secure notes app. Early stage / experimental. Intended eventually for personal use and possibly shared with others.

## Tech Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Database:** Supabase (Postgres + Row-Level Security)
- **Deployment:** Netlify
- **Styling:** Tailwind CSS

## Project Vision
- Voice-first interface for capturing and retrieving notes
- Dual security model: cloud vs local/on-device processing
- AI-powered search and summarisation
- ElevenLabs Conversational AI integration planned

## Stage
Early / experimental — architecture may change. Favour simplicity and flexibility over premature optimisation.

## Security Principles
- Notes are personal and potentially sensitive
- RLS must be enforced on all Supabase tables
- Never log note contents
- On-device processing preferred for sensitive content where possible

## Conventions
- TypeScript strict mode
- Server components by default
- Keep it simple — this is a personal project, avoid over-engineering
- Document architectural decisions as you go
