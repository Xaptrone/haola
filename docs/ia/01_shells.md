# Shells and breakpoints

Three chrome systems. Pick by route, then adapt by width. Never shrink a dashboard into a phone.

## Marketing shell — `/`, `/creators`

- Top nav: How it works · Trust · For creators · Start a campaign
- Wide canvas on desktop; sticky thumb CTA on mobile
- Guest AI campaign prompt uses the same card language as in-app AI
- After signup → Business workspace (see `07_workspaces.md`)

## Work shells — `/work/*`

### Creator

- Mobile: `MobileAppShell` + bottom nav
- Desktop: `StudioShell` — blank/populated canvas, bottom composer, optional inspector
- Create / blank canvas is the default for a new creator

### Business

- Mobile: `MobileAppShell` + bottom nav
- Desktop: `CommandShell` — action feed + campaign cards + AI dock (not a blank artboard)
- Login router decides setup vs draft vs home (`07_workspaces.md`)

### Shared work rules

- One primary action per screen
- Full-screen sheets on mobile
- `dvh` + safe-area; no horizontal overflow
- Keyboard must not cover composer; layout must not jump when sheets/dialogs open
- Vertical video is a stage, not a thumbnail in a table
- Long captions wrap inside cards; never force horizontal scroll

## Oversight shell — `/oversight/*`

- `lg+`: sidebar + queues + drillable metrics
- `< lg`: card queues; tap into work review
- Sidebar is illegal on marketing and work routes
