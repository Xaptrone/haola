---
name: haola-uiux
description: >-
  Project Haola UI/UX router. Use when designing, polishing, previewing, or
  building Haola marketing, creator studio, business workspace, dashboards,
  Tailwind, components, landing pages, or mobile/desktop shells. Dark canvas,
  ember accent, Sora, video-first, AI action cards. Tokens in DESIGN.md win
  over upstream skill palettes.
---

# Haola UI/UX

Read this first on any visual work in this repo. Then load **one** upstream skill.

**Design read (always state before coding):**
*"Reading this as: [surface] for [creator | restaurant owner | manager], cinematic dark editorial, ember spark, native-app on mobile / canvas on creator desktop."*

Haola is a virtual-KOL marketplace for Malaysian F&B. Young, intelligent, premium, fast. AI is the operating layer, not a chatbot widget.

## Brand (this file wins — do not "improve" these away)

| Token | CSS | 60/30/10 |
| --- | --- | --- |
| Canvas | `--color-canvas` `#12110F` | 60% |
| Surface | `--color-surface` `#1E1C18` | 30% |
| Elevated | `--color-elevated` `#26231E` | 30% |
| Ink | `--color-ink` `#F4F0EA` | |
| Muted | `--color-muted` `#9A948A` | |
| Line | `--color-line` | 30% hairline |
| Accent | `--color-accent` `#FF5C1A` | 10% spark |

- Type: **Sora** 400/500/600. JetBrains Mono for scores and provenance. Never Inter, Geist, Roboto, Arial.
- Radius: 12px cards, 24px sheets, pills only for CTAs and chips.
- Spacing: 4/8/12/16/24/32/48. Tap 44px, primary 56px. Motion ≤ 200ms, ease-out only.
- One card elevation. One accent. Predicted scores labelled Predicted.

Source of truth: [DESIGN.md](../../../DESIGN.md) and `src/app/globals.css`.

## Surfaces (do not mix chrome)

| Surface | Mode | First thing the eye hits |
| --- | --- | --- |
| `/` landing | Persuade | Headline + 9:16 reel + one ember CTA |
| Creator studio | Operate | Blank canvas question, or cards on the board |
| Business workspace | Operate | Next action, not a dashboard |
| `/oversight/*` | Read | Queue first, then 2–3 drillable metrics |

Creator desktop = **studio canvas** (exception to “desktop is dashboards”). Business desktop = **command list**. Marketing may be wide. Never shrink a table onto a phone.

## Load next (one primary)

| Job | Load |
| --- | --- |
| Landing / conversion | `.agents/skills/design-taste-frontend/SKILL.md` then this brand |
| Calm expensive craft / audit | `.agents/skills/impeccable/SKILL.md` |
| Product UI / shells | `.agents/skills/emil-design-eng/SKILL.md` |
| Motion | `.agents/skills/animate/SKILL.md` |
| 60/30/10 check | `~/.cursor/skills/minimal-uiux-design/SKILL.md` |
| Conversion / tap / reduce | `~/.cursor/skills/senior-product-design/SKILL.md` |

If an upstream skill wants bone paper, Inter, purple mesh, three equal feature cards, or a second accent — **ignore it**. Haola tokens stay.

## Preview standard

Squint test: ~60% dark air, ~30% frames, one ember spark.

**Landing:** Asymmetric on desktop (type left, phone-reel right). No hero feature grid. No “Book a demo” as primary. Sticky thumb CTA on mobile.

**Blank canvas:** Empty on purpose. One question. Three intents. Composer docked bottom-center.

**AI:** Short line + action card. Clarify = 2–3 chips. Provenance on every artifact.

**Hard bans:** Inter; Lucide soup; `shadow-md`/`shadow-lg`; hex in JSX (use tokens); `transition: all`; `ease-in`; emoji; decorative robot art; gradient skins; chat-bubble walls; generic SaaS sidebar on work routes.

## Additional resources

- Tokens and do/don't: [reference.md](reference.md)
- IA: `docs/ia/`
