# Bookstead — Brand Book

## The idea
**Bookstead** = books + homestead. A homestead is land you own outright — nobody can raise the rent, nobody can lock the gate. Bookstead is that, for a business's financial history. The brand exists in opposition to a specific, verified anger: *your own books held hostage behind a $1,049/year renewal.*

## Name
- **Bookstead** (one word, capital B). Never "BookStead", never "book stead".
- Verified clean: no active company, product, GitHub org, or USPTO filing found (July 2026); bookstead.com is parked/for-sale, not in use. (Predecessor name "Ledgerlift" was abandoned — active firm + live trademark applications; see DECISIONS.md D-009.)

## Tagline
**"Your books, yours again."**
Supporting lines (approved): "No subscription. No upload. No asking permission." · "Twenty years of your books shouldn't need a login." · "The archive outlives the software."

## Voice
Plainspoken, sturdy, quietly defiant. An old-fashioned country accountant who has seen every trick and isn't impressed. Short declaratives. Concrete nouns. Numbers over adjectives.
- Say: "Nothing uploads. Turn your wifi off and watch it keep working."
- Never say: "revolutionize", "supercharge", "AI-powered", "unlock insights", exclamation marks.
- Honesty is a brand feature: we name what the product does NOT do (audit trail, attachments, payroll detail aren't in QuickBooks' exports, so they aren't in the archive — and we say so on the pricing page).
- Trademark discipline: first mention is "QuickBooks® Desktop"; footer carries "Intuit and QuickBooks are registered trademarks of Intuit Inc. Bookstead is not affiliated with or endorsed by Intuit." Never Intuit's logo, green trade dress, or "QB" in our name/domain.

## Logo
The mark is a **book-roof house**: an open book whose pages form the gable roof of a homestead. It reads as "a home built from your books." Geometric, single-weight, works at 16px favicon size. Files: `src/components/Logo.tsx`, `public/icon.svg`.
Clear space: one door-width around the mark. Don't rotate, gradient, or shadow it.

## Palette
| Token | Hex | Use |
|---|---|---|
| Ink | `#1B2A22` | headlines, body text |
| Stead Green | `#2E5E43` | primary actions, logo, links |
| Deep Pine | `#1E4230` | hover/pressed, footer |
| Paper | `#F7F4EC` | page background |
| Cream Card | `#FFFDF7` | cards, panels |
| Harvest Copper | `#C67A28` | accents, highlights, the "launch price" tag |
| Field Slate | `#5B6B62` | secondary text |
| Verified Green | `#1E7A4E` on `#E4F2EA` | reconciliation success |
| Ledger Red | `#A93226` on `#FBEAE7` | mismatches, warnings |
| Rule | `#E2DDD0` | hairlines, table rules |

Accessibility: Ink on Paper = 13.4:1; Stead Green on Paper = 6.7:1; all interactive pairs ≥ 4.5:1.

## Type
Zero webfonts (the no-third-party-requests promise applies to the brand too):
- **Display/headline:** `Georgia, 'Iowan Old Style', 'Times New Roman', serif` — the farmhouse-ledger warmth.
- **UI/body:** `-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`.
- **Numbers/tables:** same UI stack with `font-variant-numeric: tabular-nums`.

## The verified badge
The single most important brand element is the reconciliation verdict:
- ✓ **"Matches QuickBooks to the penny"** — Verified Green pill, never larger than the numbers it certifies.
- ⚠ mismatches shown with the exact account and delta — Ledger Red, with the fix-it hint. We never soften a red result; the credibility of the green depends on it.

## Founder identity
This company was researched, designed, built, and packaged end-to-end by an AI agent, and the brand does not hide it: the founder video says so plainly. No fake human founder persona, no stock-photo team page. The products of that honesty: every claim in our marketing carries a source, and the reconciliation report shows its work.
