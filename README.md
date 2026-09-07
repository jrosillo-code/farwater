# FARWATER

Expedition spearfishing & sportfishing in water almost nobody has hunted.
Founded by Jacobo Rosillo and Elliot Chung at the University of Michigan.

## Stack

React 18 + Vite (client), Express + Drizzle (server), deployed on Vercel as a
static SPA plus one serverless function (`api/index`). Same architecture as its
sibling site, different company and design system.

- `client/src/lib/brand.ts` — the company name, domain and thesis in one file.
  Renaming the brand starts here.
- `client/src/lib/departures.ts` — the founding slate. Every page (list,
  detail, application flow, prerendered share cards) reads from this file, so
  a departure exists exactly once.
- `client/src/components/sea-chart.tsx` — the generated bathymetric-chart
  hero. Deliberate: the company owns no expedition footage yet and will not
  pretend with stock video. Real film replaces it clip by clip.
- `scripts/prerender-meta.mjs` — per-departure `<title>`/OG tags baked at
  build time for link unfurlers.

## Develop

```
npm install
npm run dev
```

## Deploy (Vercel)

1. Vercel → Add New → Project → import `jrosillo-code/farwater` (defaults are
   read from `vercel.json`).
2. Optional env vars (site works without them): `DATABASE_URL` (Postgres for
   applications/subscribers), `RESEND_API_KEY` + `NOTIFY_EMAIL` + `FROM_EMAIL`
   (mail), `OPENAI_API_KEY` (chat deckhand), `ADMIN_KEY` (/admin).
