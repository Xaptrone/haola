# fxgen

Virtual KOL marketplace for Malaysian SMEs. Dark canvas, purple accent, AI as the operating layer.

## Setup

```bash
cp .env.example .env.local
# set AUTH_SECRET (openssl rand -base64 32)
# set AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Create an account with email, or log in with Google / WhatsApp when those are configured.

The public site is live: landing, sign-in, empty workspaces. Guest campaigns and new jobs wait for a creator match instead of assigning Mei Lin. Internal Chef Ton demo chrome (`/preview`, `?preview=1`) is off unless you set `NEXT_PUBLIC_FXGEN_PREVIEW=1`.

Google Cloud: authorized redirect `{origin}/api/auth/callback/google`. Production origin: `https://haola.escor.ai`.

## Design

Read [DESIGN.md](./DESIGN.md) and `.cursor/skills/haola-uiux/SKILL.md`. Tokens in `src/app/globals.css`. Logo: `public/fxgen-logo-dark.png`.
