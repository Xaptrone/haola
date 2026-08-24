# Project Haola — Interface principles

Haola is a virtual-KOL marketplace for F&B. The interface is AI-native from the first screen. Do not build a form-heavy admin tool and add a chatbot later.

## Four surfaces

1. **Marketing** — public acquisition. Primary audience: restaurant / business owners.
2. **Creator workspace (studio)** — where creators make virtual KOLs and content. Mobile app, desktop canvas, blank canvas zero-state.
3. **Business workspace** — provisioned on register, entered on login. Restaurant setup, campaigns, approvals, payouts.
4. **Oversight dashboards** — Super Admin, Admin, Manager, performance, finance. Monitoring only.

## Rules

- Desktop dashboards are for oversight, comparison, configuration. They are not the default after login.
- Creator desktop is a **studio canvas**, not a dashboard and not a squeezed phone.
- Business desktop after login is a **command workspace** (next actions + AI), with performance dashboards one tap away.
- All operating flows are mobile-first: one primary action, thumb-friendly, sheets, step-by-step, saved drafts.
- AI is the operating layer. It understands user, role, workspace, current KOL, campaign, stage, known facts, missing facts, and permissions.
- Clarify instead of guessing. Short question, two or three options. Never invent campaign facts.
- AI replies as action cards, not essay bubbles.
- Always mark provenance: User, Verified, AI suggestion, Predicted, Manager decision.
- Predicted scores (AMF, match %) are never presented as verified facts.
- One design language for marketing, creator, business, manager.

## What Phase 1 will not do

- Compress desktop tables into mobile.
- Use different visual languages per role.
- Land a new business owner on an empty admin screen.
- Land a new creator on a settings form.
- Treat the landing page chatbot as a gimmick disconnected from in-app AI.
