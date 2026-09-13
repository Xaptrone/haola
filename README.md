# fxgen

Virtual KOL marketplace for Malaysian SMEs. Dark canvas, purple accent, AI as the operating layer.

## Preview

```bash
cp .env.example .env.local
# set AUTH_SECRET (openssl rand -base64 32)
# set AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Create an account with email, or log in with Google / WhatsApp when those are configured. Surfaces behind `?preview=1` are internal only.

Google Cloud: authorized redirect `{origin}/api/auth/callback/google`. Production origin: `https://haola.escor.ai`.

## Design

Read [DESIGN.md](./DESIGN.md) and `.cursor/skills/haola-uiux/SKILL.md`. Tokens in `src/app/globals.css`. Logo: `public/fxgen-logo-dark.png`.
