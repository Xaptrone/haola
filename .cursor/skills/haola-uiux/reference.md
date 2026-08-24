# Haola UI reference

Read from [SKILL.md](SKILL.md). Tokens live in `src/app/globals.css` and [DESIGN.md](../../../DESIGN.md).

## CSS variables — never hex in JSX

```css
--color-canvas: #12110F;     /* 60% */
--color-surface: #1E1C18;    /* 30% */
--color-elevated: #26231E;   /* 30% */
--color-ink: #F4F0EA;
--color-muted: #9A948A;
--color-accent: #FF5C1A;     /* 10% */
--color-line: rgb(244 240 234 / 0.1);
```

Tailwind: `bg-canvas`, `bg-surface`, `bg-elevated`, `text-ink`, `text-muted`, `bg-accent`, `border-line`.

## Type scale (per view, 2–3 sizes)

- Display: 40–56px / 600 / tracking tight — landing hero only
- Title: 22–28px / 500
- Body: 15–16px / 400 / leading 1.5
- Meta: 10–11px / mono / uppercase / muted — provenance, scores

## Preview layouts

### Landing (Persuade)
Desktop: split. Left type + one CTA. Right one 9:16 reel in a quiet device frame. Rest of page: three numbered steps, one trust row, one real action-card as proof. Mobile: stacked, reel below headline, sticky ember CTA.

### Creator blank canvas
Centered prompt. Three full-width intents (KOL / content / upload). No sidebar. Composer reserved at bottom. Desktop is a board; mobile is the same question inside the app shell.

### Business after login
If draft → campaign cards already on the board. If new → three setup chips. If ready → action feed. Never an empty table.

## Do

- One primary button per screen
- Provenance chip on AI output
- `min-h-dvh` / `100svh` for shells
- Safe-area padding on bottom nav
- Vertical video as a stage (`aspect-ratio: 9/16`)

## Don't

- Bone/cream canvas (that's ESCOR/Takumi)
- Purple mesh, glassmorphism soup, three equal icon cards
- Desktop sidebar on `/` or `/work/*`
- Compress tables for mobile
- Present AMF as a fact
