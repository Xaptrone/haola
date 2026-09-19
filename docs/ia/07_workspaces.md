# Workspaces

A workspace is the durable home a user enters after register / login. It is not a page. It is the container for identity, drafts, assets, and AI context.

Phase 1 has two product workspaces (plus later manager/admin oversight, which is not a “studio”).

---

## 1. Creator workspace (studio)

Provisioned on creator registration. Purpose: make virtual KOLs and content.

### Register

Creators do not fill a business form. The name brands see is a **creator name**.

1. `/creators` → Open a studio → `/register/creator`.
2. **Account** — email + password, Google, or WhatsApp. No creator name on this screen. Copy is studio language (`you@email.com`), never `you@brand.my`.
3. **Your card** — “What should brands call you?” Required creator name (visible label, why it exists). Optional Instagram. Required market chips: Kuala Lumpur, Penang, or both. WhatsApp does not use the phone as the name. Google may prefill a person name; email signup does not guess a name from the address. They can edit it.
4. Session creates the user + **creator workspace** named `{creator}'s studio`, with market stored on the workspace.
5. Enter `/work/studio` on a blank canvas: welcome by creator name, a line that names their market, then the three intents. The first virtual KOL skips the market question if they already answered it.

Returning login (`/login?intent=creator`) goes to the studio if it exists, otherwise back to the creator card.

Do not land a new creator on settings, empty tables, or “complete your profile”. Do not ask for a business name, SSM, or company. Do not ask the same name twice.

The same workspace has three presentations. Do not ship three products — ship one studio that changes chrome.

### Mobile (`< lg`)

Native app, not a shrunk desktop.

- Bottom nav: Home · Campaigns · **Create** · KOLs · Profile
- Home = action feed (attention, next step, changes, AI recs)
- Create opens a sheet: Virtual KOL · Content · Upload draft
- Flows are linear: conversation + stacked action cards + full-screen sheets
- Video review is full-bleed 9:16
- No spatial canvas — thumbs cannot manage a Figma-like board

### Desktop (`>= lg`) — studio canvas

This is the exception to “desktop is only for dashboards.”

Creator desktop is a **studio**, not a performance dashboard and not a 430px phone column.

- Thin top bar: workspace name, active KOL, active campaign, AI context chip
- Center: canvas
- AI composer docked at the bottom-center (operating layer, not a chat drawer)
- Generated artifacts land on the canvas as action cards (avatar proposal, AMF, script, QC)
- Optional right inspector when a card is selected (edit fields, provenance, score breakdown)
- Performance numbers live under Profile → Performance (oversight), not on the canvas

### Blank canvas

Zero-state of the studio. Used when:

- The creator just registered (no KOLs, no campaigns)
- They tap Create
- They clear the board to start something new

Blank canvas is empty on purpose. One question, three intents:

> What are we making?

- Create a virtual KOL
- Create content
- Upload a draft

AI then runs the conversational flow. Cards appear on the canvas (desktop) or as a stack (mobile). Never open a long form on a blank canvas.

Virtual KOL create is still chips, not a profile wall: market (skipped if the studio already has one) → who follows them → what they are known for → how they sound → avatar proposal card built from those answers. One question at a time.

First-run copy: welcome by name, one line on what Haola is for creators, then the three intents. No settings, no empty tables, no “complete your profile” wall before they can create.

---

## 2. Business workspace

Provisioned **atomically at business registration**. Login always enters this workspace. Never land an owner on a blank void or a generic dashboard.

Created with:

- Organisation + owner (seat: owner | marketing)
- `brands[]` (empty until setup)
- `campaigns[]` / review jobs / Brand IP jobs
- `onboardingStage`: `welcome` → `business` → `goal` → `ready`
- `guestDraftId` if they started a campaign on the marketing landing

### Register

1. Owner submits email / auth (minimal).
2. Server creates user + **business workspace** in one transaction.
3. Attach guest campaign draft if present.
4. Enter workspace immediately (no “check your inbox before you have a home”).

### Login routing (strict order)

1. If `guestDraftId` or unfinished campaign draft → AI campaign builder with that draft.
2. Else if `onboardingStage !== ready` → AI business setup (not a 12-field form).
3. Else → Home action feed.

### Mobile (`< lg`)

- Bottom nav: Home · Campaigns · **Create** · Content · Business
- Create starts Campaign / Brand IP / Content pack
- Home answers: what needs approval, what is due, what AI recommends, credit spend (owner)
- Business setup, create intents, content approval, credits = sheets and step flows

### Desktop (`>= lg`) — command workspace

Business owners are not artists. They do **not** get a blank creative canvas as home.

After login they get a **command workspace**:

- Left: nothing (no admin sidebar)
- Main: action feed + live campaigns as cards
- AI dock: “What should we promote this week?”
- Content waiting for approval opens a split review (video + decision)
- Performance dashboard is a destination (`/oversight/business`), not the login landing

Campaign creation on desktop can use a **focused canvas** (brief card + recommended KOLs) — a working board, not an empty artboard. If they have no brand yet, the board is the setup conversation, not a blank studio.

### First-run (no guest draft)

AI asks, with chips:

- Which business is this workspace for?
- One location or a group?
- First goal: bookings, a new offer, a promotion, or brand awareness?

Then it writes a brand card + optional first campaign brief. Owner accepts or edits. `onboardingStage` becomes `ready`.

### First-run (from landing guest prompt)

Workspace opens with the draft campaign brief and recommended KOL cards already on the board. Primary action: Continue · Edit · Save draft. Brand facts still go through clarify-if-missing — never invent location or price.

---

## 3. Workspace vs dashboard vs landing

| Surface | Who | First screen |
| --- | --- | --- |
| `/` landing | Anonymous owner | Marketing + guest AI |
| Creator workspace | Creator | Blank canvas (new) or action feed / canvas (returning) |
| Business workspace | Owner | Draft / setup / action feed (never empty admin) |
| `/oversight/*` | Manager, admin, owner performance | Queues, metrics, drill-down |

Manager and Admin also get workspaces later (review queues). Google login without intent opens `/start` to pick business or creator. Creator intent (`/register/creator` or `/login?intent=creator`) never asks for a business name. Staff emails in `FXGEN_MANAGER_EMAILS` can open Operations. Internal preview: `?preview=1`.

---

## 4. AI context bound to the workspace

Every workspace session injects:

- `workspaceId`, `workspaceKind` (`creator` | `business`)
- user, role
- current brand (business) or current KOL (creator)
- current campaign, stage
- known platform facts vs missing facts
- permission boundary (cannot approve own QC as manager unless role allows)

Guest landing prompt uses a **ephemeral workspace** that is promoted into the business workspace on register.
