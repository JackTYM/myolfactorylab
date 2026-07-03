# MyOlfactoryLab

A personal fragrance-layering tracker — log scent combos across six layers (body wash, lotion,
oil, perfume oil, mist, perfumes/toppers), tag them by season and vibe, rate and log usage over
time, keep a wishlist, and jot general notes. Installable as an iOS WebClip (Add to Home Screen).

Nuxt 4 / Vue 3 static SPA, deployed to Cloudflare Pages, backed by:

- **Neon Auth** — email/password + Google sign-in
- **Neon Data API** — PostgREST-style REST over Postgres, called directly from the browser,
  scoped per-user by Row-Level Security (RLS). No backend server involved for data.
- **Cloudflare R2** — combo photos, written through the one authenticated Cloudflare Pages
  Function in this app (`functions/api/photos.ts`); reads go straight to R2's public URL.

## Local development

```bash
npm install
cp .env.example .env   # already has working NUXT_PUBLIC_* values; fill in DATABASE_URL if you need to run migrations
npm run dev
```

Runs at `http://localhost:3000`. The app is `ssr:false` (a pure client-side SPA) — there's no
server-rendered HTML, only a static shell that hydrates in the browser.

## Database

Schema lives in `db/schema.ts` (Drizzle ORM), migrations in `db/migrations/`. Drizzle is used
**only** to author and apply schema/RLS — the running app never queries through Drizzle, it talks
to the Neon Data API directly.

```bash
npx drizzle-kit generate   # after changing db/schema.ts
npx drizzle-kit migrate    # applies to Neon (needs DATABASE_URL in .env)
```

**After any migration that adds new tables**, re-run `db/grants.sql` against the database (see
that file for why — the Data API needs explicit `GRANT`s in addition to RLS policies).

## Tests

```bash
npx vitest run       # unit tests (app/utils/olab.ts)
npx vue-tsc --noEmit  # typecheck
```

## Deploying

1. **Cloudflare Pages project**, connected to this repo:
   - Build command: `npm run generate`
   - Build output directory: `dist` — **not** `.output/public`. Nitro auto-detects it's building
     in Cloudflare's CI and switches to the `cloudflare-pages-static` preset, which outputs to
     `dist` (a local `npm run generate` outside that CI env produces `.output/public` instead —
     don't be misled by that when testing locally).
   - Root directory: `/` (repo root, so Cloudflare finds `functions/` alongside `package.json`)

2. **Build environment variables** (Pages → Settings → Environment variables, both
   Production and Preview) — copy straight from `.env.example`'s `NUXT_PUBLIC_*` values.

3. **Pages Function settings** (Pages → Settings → Functions):
   - Environment variable `NEON_JWKS_URL` — the JWKS endpoint from your Neon Auth URL
     (`{NEON_AUTH_URL}/.well-known/jwks.json`)
   - R2 bucket binding named `PHOTOS`, mapped to your R2 bucket
   - `functions/auth/[[path]].ts` needs no config — it proxies `/auth/*` to the hardcoded Neon
     Auth host so the session cookie is set first-party (a direct cross-origin auth URL makes the
     cookie third-party, which iOS Safari's WebClip storage silently drops — logins never persist
     once the app is added to the Home Screen). `NUXT_PUBLIC_NEON_AUTH_URL` must be the relative
     `/auth` (as in `.env.example`), not the direct Neon host, for this to take effect.

4. **Neon Auth trusted origins** — add your deployed Pages URL (`https://your-project.pages.dev`)
   via the Neon Console (Auth → trusted origins) or the Neon MCP `configure_neon_auth` tool.
   `localhost` stays allowed for local dev.

5. **Neon Data API CORS** — Neon Console → Data API → Settings → Advanced settings → CORS
   allowed origins. Add your deployed Pages URL here too — this is a **separate** setting from
   Neon Auth's trusted origins, and both matter (Auth trusted origins gates sign-in/CSRF; Data
   API CORS gates whether the browser can read `combos`/`notes`/etc. responses at all).

Cloudflare Pages bakes bindings and environment variables into each deployment at build time —
changing them in Settings doesn't retroactively apply to an already-live deployment. Trigger a
fresh deploy after changing any of the above.
