# MyOlfactoryLab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the MyOlfactoryLab React/JSX design prototype into a real, multi-user, cloud-backed Nuxt/Vue static SPA — deployable to Cloudflare Pages, backed by Neon Auth + the Neon Data API + Cloudflare R2, installable as an iOS WebClip.

**Architecture:** Nuxt 4 SPA (`ssr:false`, `nuxt generate` → static `.output/public`) talks directly to the Neon Data API (PostgREST over HTTP, RLS-scoped by JWT `sub`) and Neon Auth (Better Auth) via the `@neondatabase/neon-js` client — no Cloudflare Worker in that path. The only serverless code is one Cloudflare Pages Function (`functions/api/photos.ts`) that authenticates a JWT and writes/deletes objects in R2; reads go straight to the R2 public URL.

**Tech Stack:** Nuxt 4, Vue 3 `<script setup>`, Pinia, `@neondatabase/neon-js`, Drizzle ORM (schema/RLS authoring only — runtime queries go through the Data API, not Drizzle), Cloudflare Pages + Pages Functions + R2, Vitest.

**User decisions (already made):**
- Port the finished React/JSX design to Nuxt/Vue SFCs (not built in React).
- Reference lists (scent library, vibes, layers, wishlist categories) live in Neon, per-user editable — not hardcoded constants.
- Sign-in: email/password + Google (Google via Neon Auth's shared dev credentials).
- Drop the design's device-frame chrome (`frames/ios-frame.jsx`) and live theme editor (`tweaks-panel.jsx`) — ship the "Antique Brass / Warm Ink / Playfair" theme as fixed CSS.
- Data API auth model: `auth.user_id()` (JWT `sub`) via Drizzle's `crudPolicy`/`authUid` helpers from `drizzle-orm/neon` — confirmed against Neon's RLS + Data API docs.
- Neon project `myolfactorylab` (`morning-tooth-46552476`) already has Neon Auth + Data API provisioned; Data API URL confirmed live: `https://ep-dark-meadow-atpy3tcm.apirest.c-9.us-east-1.aws.neon.tech/neondb/rest/v1`.

---

## Source material

Design project: `db62da18-beaa-497c-a67a-0a5f79ced62d` (Claude Design, fetched via `DesignSync get_file`). Files already read in full during planning: `index.html`, `app.jsx`, `data.jsx`, `ui.jsx`, `icons.jsx`, `cards.jsx`. Not yet read: `screens.jsx`, `screens2.jsx` — Task 7 fetches these directly at execution time (they're large; re-fetch live rather than duplicate here).

---

## File Structure

```
myolfactorylab/
  app/
    app.vue                        # root: auth gate, tab nav, TabBar, toast (Task 8)
    assets/theme.css                # verbatim :root theme + helper classes from design's index.html (Task 0)
    components/
      Icon.vue                      # Task 6
      TabBar.vue                    # Task 8
      Toast.vue                     # Task 8
      AuthScreen.vue                 # Task 5
      ui/                            # Task 6 — DropPhoto, VibeTag, RatingStars, HeartButton, CheckBox,
                                      #          Toggle, Dropdown, TextArea, Input, Seg, Chip, SectionHeader,
                                      #          PrimaryButton, GhostButton, IconButton, Rule, Panel
      cards/
        ComboCard.vue                # Task 7 (+ MetaBadge/MiniMeter as local sub-components)
      screens/
        CombosScreen.vue             # Task 7
        ComboEditorScreen.vue        # Task 7
        WishListScreen.vue           # Task 7
        ReportScreen.vue             # Task 7
        NotesScreen.vue              # Task 7
    stores/
      auth.ts                        # Task 2
      reference.ts                   # Task 3 — layers/vibes/scents/wishCategories + seeding
      combos.ts                      # Task 4
      notes.ts                       # Task 4
      wishlist.ts                    # Task 4
    utils/
      olab.ts                        # Task 0 — ported pure helpers from data.jsx
      olab.test.ts                   # Task 0
      seedData.ts                    # Task 3 — DEFAULT_LAYERS / DEFAULT_SCENTS / DEFAULT_VIBES / DEFAULT_WISH_CATEGORIES
    plugins/
      neon.client.ts                 # Task 2
    composables/
      useNeon.ts                     # Task 2
  db/
    schema.ts                        # Task 1 — Drizzle schema + RLS
  drizzle.config.ts                  # Task 1
  functions/
    api/
      photos.ts                      # Task 9 — Cloudflare Pages Function
  nuxt.config.ts                     # Task 0
  package.json                       # Task 0 (deps)
  .env.example                       # Task 0 / Task 10
```

---

### Task 0: Nuxt foundation — config, theme, deps, ported utils

**Goal:** Reconfigure the Nuxt scaffold for a static SPA with the design's theme loaded globally, install all needed dependencies, and port the design's pure JS helpers with tests.

**Files:**
- Modify: `nuxt.config.ts`
- Modify: `package.json` (dependencies)
- Create: `app/assets/theme.css`
- Modify: `app/app.vue` (temporary placeholder — full shell built in Task 8)
- Create: `app/utils/olab.ts`
- Create: `app/utils/olab.test.ts`
- Create: `.env.example`
- Create: `vitest.config.ts`

**Acceptance Criteria:**
- [ ] `npm run dev` boots with no SSR (view-source shows an empty `<div id="__nuxt">` shell, not server-rendered markup)
- [ ] The page renders with the design's dark theme background/fonts loaded (Playfair Display, Hanken Grotesk, IBM Plex Mono via Google Fonts)
- [ ] `npx vitest run` passes for `app/utils/olab.test.ts`
- [ ] `npm run generate` produces `.output/public/index.html`

**Verify:** `npm run generate && ls .output/public/index.html && npx vitest run`

**Steps:**

- [ ] **Step 1: Install dependencies**

```bash
npm install pinia @pinia/nuxt @neondatabase/neon-js drizzle-orm
npm install -D drizzle-kit dotenv vitest @vue/test-utils
```

- [ ] **Step 2: Rewrite `nuxt.config.ts`**

```typescript
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  modules: ['@pinia/nuxt'],
  css: ['~/assets/theme.css'],
  app: {
    head: {
      title: 'MyOlfactoryLab',
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Hanken+Grotesk:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap',
        },
      ],
      meta: [
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'MyOlfactoryLab' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
        },
      ],
    },
  },
  runtimeConfig: {
    public: {
      neonDataApiUrl: '',
      neonAuthUrl: '',
      r2PublicUrl: '',
      uploadEndpoint: '/api/photos',
    },
  },
});
```

- [ ] **Step 3: Create `app/assets/theme.css`**

Copy the `:root { ... }` block and the `*`, `html/body`, `#stage`/`#device-wrap` (drop these two — no device frame), `.ol-scroll`/`.no-scrollbar`, `.graph-tex`, `.serif`/`.mono`/`.kicker`, `button`/`input`/`textarea`/`::selection`, and `@keyframes` rules verbatim from the design's `index.html` `<style>` block (fetch via `DesignSync get_file` on `index.html` in project `db62da18-beaa-497c-a67a-0a5f79ced62d` if not already in context). Apply `body`'s background/font/color rules directly to `body` (no `#stage` wrapper, no `overflow: hidden` — the app is now a normal scrollable full-page layout, not a fixed device canvas). Drop `body.no-tex` (theme tweaks are gone).

- [ ] **Step 4: Replace `app/app.vue` with a placeholder** (full shell comes in Task 8)

```vue
<template>
  <div style="padding: 40px; color: var(--text-hi); font-family: var(--serif)">
    MyOlfactoryLab — foundation ready.
  </div>
</template>
```

- [ ] **Step 5: Write `app/utils/olab.ts`**

```typescript
// app/utils/olab.ts — pure helpers ported from the MyOlfactoryLab design (data.jsx).
// Layer keys are no longer a fixed constant (layers are per-user editable, see stores/reference.ts),
// so any function that needs them takes `layerKeys: string[]` as a parameter.

export interface Combo {
  id: string | null;
  name: string;
  layers: Record<string, string[]>;
  season: string;
  highHeat: boolean;
  vibe: string;
  favorite: boolean;
  rating: number;
  longevity: number;
  projection: number;
  note: string;
  history: string[];
  photoKey: string | null;
}

export const LONGEVITY_LABELS: Record<number, string> = { 0: 'Not rated', 1: 'Short', 2: 'Medium', 3: 'Long' };
export const PROJECTION_LABELS: Record<number, string> = { 0: 'Not rated', 1: 'Soft', 2: 'Moderate', 3: 'Strong' };
export const SEASONS = ['Fall/Winter', 'Spring/Summer'];

export function daysSince(dateStr: string | null, now = new Date().toISOString().slice(0, 10)): number | null {
  if (!dateStr) return null;
  const a = new Date(dateStr + 'T00:00:00');
  const b = new Date(now + 'T00:00:00');
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export function prettyDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function layerArr(combo: Combo, k: string): string[] {
  const v = combo.layers && combo.layers[k];
  return Array.isArray(v) ? v : v ? [v] : [];
}

export function filledLayers(combo: Combo, layerKeys: string[]): string[] {
  return layerKeys.filter((k) => layerArr(combo, k).length);
}

export function allScents(combo: Combo, layerKeys: string[]): string[] {
  return layerKeys.flatMap((k) => layerArr(combo, k));
}

export function comboTitle(combo: Combo, layerKeys: string[]): string {
  if (combo.name && combo.name.trim()) return combo.name.trim();
  const pt = layerArr(combo, 'perfumesToppers');
  if (pt.length) return pt[0];
  const f = filledLayers(combo, layerKeys);
  if (f.length) return layerArr(combo, f[0])[0];
  return 'Untitled Combo';
}

export function history(combo: Combo): string[] {
  return Array.isArray(combo.history) ? combo.history : [];
}

export function lastUsed(combo: Combo): string | null {
  const h = history(combo);
  if (!h.length) return null;
  return [...h].sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
}

export function usesWithin(combo: Combo, days: number): number {
  return history(combo).filter((d) => {
    const n = daysSince(d);
    return n !== null && n >= 0 && n <= days;
  }).length;
}

export function usageCounts(combo: Combo) {
  return {
    m1: usesWithin(combo, 30),
    m3: usesWithin(combo, 91),
    m6: usesWithin(combo, 182),
    total: history(combo).length,
  };
}

export function lastUsedMono(combo: Combo): string {
  const d = daysSince(lastUsed(combo));
  if (d === null) return 'NEVER USED';
  if (d <= 0) return 'USED TODAY';
  if (d === 1) return 'USED 1D AGO';
  if (d < 30) return `USED ${d}D AGO`;
  const w = Math.round(d / 7);
  return w < 8 ? `USED ${w}W AGO` : `USED ${Math.round(d / 30)}MO AGO`;
}

export function newCombo(layerKeys: string[]): Combo {
  return {
    id: null,
    name: '',
    layers: Object.fromEntries(layerKeys.map((k) => [k, []])),
    season: 'Spring/Summer',
    highHeat: false,
    vibe: '',
    favorite: false,
    rating: 0,
    longevity: 0,
    projection: 0,
    note: '',
    history: [],
    photoKey: null,
  };
}
```

Note the one deliberate behavior change from the design: `daysSince` defaults `now` to the real current date (`new Date()`), not a frozen demo constant — the original `data.jsx` pinned `TODAY = '2026-07-02'` for prototype stability, which would be wrong in a real multi-day-use app. Also `newCombo().id` is `null` (not a client-generated string) because `combos.id` is a DB-generated `uuid`; the editor only gets a real `id` after the first successful save.

- [ ] **Step 6: Write `app/utils/olab.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { daysSince, comboTitle, usageCounts, lastUsedMono } from './olab';
import type { Combo } from './olab';

function stubCombo(overrides: Partial<Combo> = {}): Combo {
  return {
    id: '1', name: '', layers: {}, season: 'Spring/Summer', highHeat: false, vibe: '',
    favorite: false, rating: 0, longevity: 0, projection: 0, note: '', history: [], photoKey: null,
    ...overrides,
  };
}

describe('daysSince', () => {
  it('returns 0 for the same day', () => {
    expect(daysSince('2026-07-02', '2026-07-02')).toBe(0);
  });
  it('returns null for a missing date', () => {
    expect(daysSince(null, '2026-07-02')).toBeNull();
  });
  it('counts whole days between two dates', () => {
    expect(daysSince('2026-06-20', '2026-07-02')).toBe(12);
  });
});

describe('comboTitle', () => {
  const layerKeys = ['bodyWash', 'perfumesToppers'];
  it('prefers the explicit name', () => {
    expect(comboTitle(stubCombo({ name: 'Beach Vanilla' }), layerKeys)).toBe('Beach Vanilla');
  });
  it('falls back to the first perfume/topper when unnamed', () => {
    expect(comboTitle(stubCombo({ layers: { perfumesToppers: ['Vanilla Bean'] } }), layerKeys)).toBe('Vanilla Bean');
  });
  it('falls back to Untitled Combo when nothing is filled', () => {
    expect(comboTitle(stubCombo(), layerKeys)).toBe('Untitled Combo');
  });
});

describe('usageCounts', () => {
  it('buckets history entries into 1/3/6 month windows', () => {
    const iso = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString().slice(0, 10);
    const counts = usageCounts(stubCombo({ history: [iso(5), iso(60), iso(150)] }));
    expect(counts.total).toBe(3);
    expect(counts.m1).toBe(1);
    expect(counts.m3).toBe(2);
    expect(counts.m6).toBe(3);
  });
});

describe('lastUsedMono', () => {
  it('reports NEVER USED when history is empty', () => {
    expect(lastUsedMono(stubCombo({ history: [] }))).toBe('NEVER USED');
  });
  it('reports USED TODAY for a same-day entry', () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(lastUsedMono(stubCombo({ history: [today] }))).toBe('USED TODAY');
  });
});
```

Run: `npx vitest run app/utils/olab.test.ts` → expect FAIL (module doesn't exist) before Step 5, PASS after.

- [ ] **Step 7: Write `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['app/**/*.test.ts'],
  },
});
```

- [ ] **Step 8: Write `.env.example`**

```env
# Client-safe (Nuxt runtimeConfig.public — safe to expose in the static bundle)
NUXT_PUBLIC_NEON_DATA_API_URL=https://ep-dark-meadow-atpy3tcm.apirest.c-9.us-east-1.aws.neon.tech/neondb/rest/v1
NUXT_PUBLIC_NEON_AUTH_URL=https://ep-dark-meadow-atpy3tcm.neonauth.c-9.us-east-1.aws.neon.tech/neondb/auth
NUXT_PUBLIC_R2_PUBLIC_URL=https://pub-710fd787dd2041be8437c5820397bcec.r2.dev
NUXT_PUBLIC_UPLOAD_ENDPOINT=/api/photos

# Dev-only — drizzle-kit migrations only, never shipped to the client
DATABASE_URL=
```

- [ ] **Step 9: Verify and commit**

Run: `npm run generate && ls .output/public/index.html && npx vitest run`
Expected: file exists, all tests PASS.

```bash
git add nuxt.config.ts package.json package-lock.json app/assets/theme.css app/app.vue app/utils/olab.ts app/utils/olab.test.ts vitest.config.ts .env.example
git commit -m "feat: static Nuxt SPA foundation with ported olab helpers"
```

```json:metadata
{"files": ["nuxt.config.ts", "package.json", "app/assets/theme.css", "app/app.vue", "app/utils/olab.ts", "app/utils/olab.test.ts", "vitest.config.ts", ".env.example"], "verifyCommand": "npm run generate && ls .output/public/index.html && npx vitest run", "acceptanceCriteria": ["npm run dev boots with no SSR", "theme/fonts load globally", "npx vitest run passes for olab.test.ts", "npm run generate produces .output/public/index.html"], "estimatedScope": "medium"}
```

---

### Task 1: Database schema + RLS on Neon

**Goal:** Create the `combos`, `notes`, `wishlist`, `scents`, `layers`, `vibes`, `wish_categories` tables in the `myolfactorylab` Neon project with per-user RLS enforced via `auth.user_id()`, and confirm the Data API can read/write them.

**Files:**
- Create: `db/schema.ts`
- Create: `drizzle.config.ts`

**Acceptance Criteria:**
- [ ] All 7 tables exist in the `public` schema on Neon project `morning-tooth-46552476`
- [ ] `ENABLE ROW LEVEL SECURITY` + `crudPolicy` policies applied to every table (verified via `mcp__plugin_neon-plugin_neon__run_sql` querying `pg_policies`)
- [ ] `authenticated` role has been explicitly `GRANT`ed SELECT/INSERT/UPDATE/DELETE on all 7 tables (Data API requires this even though these tables were just created)
- [ ] A raw Data API request with no `Authorization` header returns 401/empty (no data leak to `anonymous`)

**Verify:** `mcp__plugin_neon-plugin_neon__get_database_tables` lists all 7 tables; `mcp__plugin_neon-plugin_neon__run_sql` with `select policyname, tablename from pg_policies where schemaname='public'` returns policies for each table.

**Steps:**

- [ ] **Step 1: Write `db/schema.ts`**

```typescript
import { sql } from 'drizzle-orm';
import { pgTable, uuid, text, boolean, integer, jsonb, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { crudPolicy, authenticatedRole, authUid } from 'drizzle-orm/neon';

const ownerId = () => text('user_id').notNull().default(sql`(auth.user_id())`);

export const combos = pgTable(
  'combos',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: ownerId(),
    name: text('name').notNull().default(''),
    layers: jsonb('layers').notNull().default({}),
    season: text('season').notNull().default('Spring/Summer'),
    highHeat: boolean('high_heat').notNull().default(false),
    vibe: text('vibe').notNull().default(''),
    favorite: boolean('favorite').notNull().default(false),
    rating: integer('rating').notNull().default(0),
    longevity: integer('longevity').notNull().default(0),
    projection: integer('projection').notNull().default(0),
    note: text('note').notNull().default(''),
    history: jsonb('history').notNull().default([]),
    photoKey: text('photo_key'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [crudPolicy({ role: authenticatedRole, read: authUid(table.userId), modify: authUid(table.userId) })]
).enableRLS();

export const notes = pgTable(
  'notes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: ownerId(),
    title: text('title').notNull().default(''),
    body: text('body').notNull().default(''),
    updatedOn: timestamp('updated_on', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [crudPolicy({ role: authenticatedRole, read: authUid(table.userId), modify: authUid(table.userId) })]
).enableRLS();

export const wishlist = pgTable(
  'wishlist',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: ownerId(),
    category: text('category').notNull(),
    note: text('note').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('wishlist_user_category_uq').on(table.userId, table.category),
    crudPolicy({ role: authenticatedRole, read: authUid(table.userId), modify: authUid(table.userId) }),
  ]
).enableRLS();

export const scents = pgTable(
  'scents',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: ownerId(),
    name: text('name').notNull(),
    layers: jsonb('layers').notNull().default([]),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('scents_user_name_uq').on(table.userId, table.name),
    crudPolicy({ role: authenticatedRole, read: authUid(table.userId), modify: authUid(table.userId) }),
  ]
).enableRLS();

export const layers = pgTable(
  'layers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: ownerId(),
    key: text('key').notNull(),
    label: text('label').notNull(),
    shortLabel: text('short_label').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('layers_user_key_uq').on(table.userId, table.key),
    crudPolicy({ role: authenticatedRole, read: authUid(table.userId), modify: authUid(table.userId) }),
  ]
).enableRLS();

export const vibes = pgTable(
  'vibes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: ownerId(),
    name: text('name').notNull(),
    color: text('color').notNull(),
    logic: text('logic').notNull().default(''),
    weight: text('weight').notNull().default(''),
    secretWord: text('secret_word').notNull().default(''),
    secretText: text('secret_text').notNull().default(''),
    bestFor: text('best_for').notNull().default(''),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('vibes_user_name_uq').on(table.userId, table.name),
    crudPolicy({ role: authenticatedRole, read: authUid(table.userId), modify: authUid(table.userId) }),
  ]
).enableRLS();

export const wishCategories = pgTable(
  'wish_categories',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: ownerId(),
    name: text('name').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('wish_categories_user_name_uq').on(table.userId, table.name),
    crudPolicy({ role: authenticatedRole, read: authUid(table.userId), modify: authUid(table.userId) }),
  ]
).enableRLS();
```

- [ ] **Step 2: Write `drizzle.config.ts`**

```typescript
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

- [ ] **Step 3: Get a connection string and apply the schema**

Use `mcp__plugin_neon-plugin_neon__get_connection_string` for project `morning-tooth-46552476` (pooled connection, default branch, `neondb`), put it in a local `.env` as `DATABASE_URL` (never commit `.env`), then:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

- [ ] **Step 4: Grant Data API access explicitly**

Newly-created tables aren't covered by `ALTER DEFAULT PRIVILEGES` set up before they existed. Run via `mcp__plugin_neon-plugin_neon__run_sql` against project `morning-tooth-46552476`:

```sql
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
```

- [ ] **Step 5: Verify RLS is active**

Via `mcp__plugin_neon-plugin_neon__run_sql`:

```sql
SELECT tablename, policyname, cmd FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;
```

Expected: 4 policy rows (select/insert/update/delete, or one `ALL` row per `crudPolicy` call) for each of the 7 tables.

- [ ] **Step 6: Commit**

```bash
git add db/schema.ts drizzle.config.ts db/migrations
git commit -m "feat: add Drizzle schema with per-user RLS for all app tables"
```

```json:metadata
{"files": ["db/schema.ts", "drizzle.config.ts", "db/migrations"], "verifyCommand": "mcp__plugin_neon-plugin_neon__run_sql: SELECT tablename, policyname FROM pg_policies WHERE schemaname='public'", "acceptanceCriteria": ["all 7 tables exist", "RLS + crudPolicy policies applied to every table", "authenticated role explicitly granted CRUD", "no data visible without a valid JWT"], "estimatedScope": "medium"}
```

---

### Task 2: Neon client plugin + auth store

**Goal:** Wire up `@neondatabase/neon-js` as a Nuxt plugin and build the Pinia auth store (email/password + Google sign-in, session state).

**Files:**
- Create: `app/plugins/neon.client.ts`
- Create: `app/composables/useNeon.ts`
- Create: `app/stores/auth.ts`

**Acceptance Criteria:**
- [ ] `useNeon()` returns a working client inside any component/store
- [ ] `useAuthStore().signUpEmail(...)` creates a real user visible via `mcp__plugin_neon-plugin_neon__run_sql` on `neon_auth.user`
- [ ] `useAuthStore().signInEmail(...)` and `signOut()` correctly flip `user.value`
- [ ] `useAuthStore().init()` restores a session across a page reload (cached by the SDK)

**Verify:** Manual — `npm run dev`, open browser console, `const a = useAuthStore(); await a.signUpEmail('test@example.com','Test1234!','Test User')` then check `a.user`.

**Steps:**

- [ ] **Step 1: `app/plugins/neon.client.ts`**

```typescript
import { createClient } from '@neondatabase/neon-js';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const client = createClient({
    auth: { url: config.public.neonAuthUrl },
    dataApi: { url: config.public.neonDataApiUrl },
  });
  return { provide: { neon: client } };
});
```

`.client.ts` suffix ensures this only runs in the browser (matches `ssr:false`, and the SDK manages browser-only session storage).

- [ ] **Step 2: `app/composables/useNeon.ts`**

```typescript
export function useNeon() {
  const { $neon } = useNuxtApp();
  return $neon;
}
```

- [ ] **Step 3: `app/stores/auth.ts`**

```typescript
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<{ id: string; email: string; name?: string } | null>(null);
  const ready = ref(false);

  async function init() {
    const neon = useNeon();
    const { data } = await neon.auth.getSession();
    user.value = data?.session?.user ?? null;
    ready.value = true;
  }

  async function signInEmail(email: string, password: string) {
    const neon = useNeon();
    const { data, error } = await neon.auth.signIn.email({ email, password });
    if (!error) user.value = data.user;
    return { error };
  }

  async function signUpEmail(email: string, password: string, name: string) {
    const neon = useNeon();
    const { data, error } = await neon.auth.signUp.email({ email, password, name });
    if (!error) user.value = data.user;
    return { error };
  }

  async function signInGoogle() {
    const neon = useNeon();
    await neon.auth.signIn.social({ provider: 'google', callbackURL: window.location.origin });
  }

  async function signOut() {
    const neon = useNeon();
    await neon.auth.signOut();
    user.value = null;
  }

  return { user, ready, init, signInEmail, signUpEmail, signInGoogle, signOut };
});
```

- [ ] **Step 4: Verify manually**

Run: `npm run dev`, open the app, in the devtools console:
```js
const a = useAuthStore()
await a.signUpEmail('test@example.com', 'Test1234!', 'Test User')
a.user // should be a user object
```
Then confirm the row via `mcp__plugin_neon-plugin_neon__run_sql`: `SELECT id, email FROM neon_auth.user WHERE email = 'test@example.com'`.

- [ ] **Step 5: Commit**

```bash
git add app/plugins/neon.client.ts app/composables/useNeon.ts app/stores/auth.ts
git commit -m "feat: wire up neon-js client and Pinia auth store"
```

```json:metadata
{"files": ["app/plugins/neon.client.ts", "app/composables/useNeon.ts", "app/stores/auth.ts"], "verifyCommand": "manual sign-up via devtools console, cross-check neon_auth.user via MCP run_sql", "acceptanceCriteria": ["useNeon() returns a working client", "signUpEmail creates a real Neon Auth user", "signInEmail/signOut flip user state", "init() restores session after reload"], "estimatedScope": "small"}
```

---

### Task 3: Reference-data store + first-login seeding

**Goal:** Port the design's default scent library, layers, vibes, and wishlist categories into a seed-data module, and build the Pinia store that loads them per-user and seeds Neon on first login.

**Files:**
- Create: `app/utils/seedData.ts`
- Create: `app/stores/reference.ts`

**Acceptance Criteria:**
- [ ] A brand-new user's first `reference.load()` call results in 6 `layers` rows, 7 `vibes` rows, 23 `scents` rows, 7 `wish_categories` rows in Neon (verify via MCP)
- [ ] A second call to `load()` for the same user does NOT duplicate rows (idempotent — only seeds when empty)
- [ ] `scentsForLayer('bodyWash')` returns the 9 body-wash scents from the design's library

**Verify:** Sign up a fresh test user, call `reference.load()` twice, then `mcp__plugin_neon-plugin_neon__run_sql`: `SELECT count(*) FROM layers WHERE user_id = '<id>'` → 6 (not 12).

**Steps:**

- [ ] **Step 1: Write `app/utils/seedData.ts`**

Ported verbatim from `data.jsx`'s `LAYERS`, `SCENT_LIBRARY` (flattened to unique scent → layers it appears in), `VIBES`, and `WISH_CATEGORIES`:

```typescript
export const DEFAULT_LAYERS = [
  { key: 'bodyWash', label: 'Body Wash', shortLabel: 'Wash' },
  { key: 'bodyLotion', label: 'Body Lotion', shortLabel: 'Lotion' },
  { key: 'bodyOil', label: 'Body Oil', shortLabel: 'Oil' },
  { key: 'perfumeOil', label: 'Perfume Oil', shortLabel: 'Perfume Oil' },
  { key: 'bodyMist', label: 'Body Mist', shortLabel: 'Mist' },
  { key: 'perfumesToppers', label: 'Perfumes and Toppers', shortLabel: 'Perfume/Topper' },
];

export const DEFAULT_SCENTS = [
  { name: 'Raspberry Sorbet', layers: ['bodyWash', 'bodyLotion', 'bodyMist'] },
  { name: 'Seaside Citrus', layers: ['bodyWash', 'bodyLotion', 'bodyMist'] },
  { name: 'Coconut Cream', layers: ['bodyWash', 'bodyLotion', 'bodyOil'] },
  { name: 'Sugared Lemon', layers: ['bodyWash'] },
  { name: 'Black Cherry', layers: ['bodyWash', 'perfumeOil'] },
  { name: 'Toasted Marshmallow', layers: ['bodyWash', 'perfumesToppers'] },
  { name: 'Sweet Pea', layers: ['bodyWash', 'bodyMist'] },
  { name: 'Cucumber Mint', layers: ['bodyWash'] },
  { name: 'Pink Grapefruit', layers: ['bodyWash', 'bodyMist'] },
  { name: 'Vanilla Bean', layers: ['bodyLotion', 'bodyOil', 'perfumeOil', 'perfumesToppers'] },
  { name: 'Cashmere Musk', layers: ['bodyLotion', 'bodyOil', 'perfumeOil', 'perfumesToppers'] },
  { name: 'Sun-Ripened Peach', layers: ['bodyLotion', 'bodyOil', 'bodyMist'] },
  { name: 'Salted Caramel', layers: ['bodyLotion', 'perfumesToppers'] },
  { name: 'White Gardenia', layers: ['bodyLotion', 'bodyOil', 'perfumesToppers'] },
  { name: 'Brown Sugar Fig', layers: ['bodyLotion', 'perfumeOil', 'perfumesToppers'] },
  { name: 'Golden Amber', layers: ['bodyOil', 'perfumeOil', 'perfumesToppers'] },
  { name: 'Warm Praline', layers: ['bodyOil', 'perfumeOil', 'perfumesToppers'] },
  { name: 'Rose Petal', layers: ['perfumeOil', 'perfumesToppers'] },
  { name: 'Champagne Fizz', layers: ['bodyMist', 'perfumesToppers'] },
  { name: 'Mango Passion', layers: ['bodyMist', 'perfumesToppers'] },
  { name: 'Iced Berry', layers: ['bodyMist'] },
  { name: 'Fresh Linen', layers: ['bodyMist'] },
  { name: 'Wild Honey', layers: ['perfumesToppers'] },
];

export const DEFAULT_VIBES = [
  {
    name: 'Bakery/Comfort', color: 'var(--fam-gourmand)', title: 'The Bakery Vibe (The "Comfort" Anchor)',
    logic: 'This is the heaviest, most "grounded" category. It uses gourmand notes (vanilla, caramel, praline, dough, spice) to evoke a physical place—a warm kitchen or a bakery. These scents are "dense" because they lack crisp or airy notes.',
    weight: 'Heavy, enveloping, warm.', secretWord: 'Persistence',
    secretText: 'These scents are designed to cling to clothes and skin for hours.',
    bestFor: 'High-stress days, cozy nights in, or whenever you need an emotional "hug" from your scent.',
  },
  {
    name: 'Creamy/Skin-Silk', color: 'var(--fam-woody)', title: 'The Creamy Vibe (The "Skin-Silk" Layer)',
    logic: 'This is the most "subtle" category. It uses musk, sandalwood, and "lactonic" (milky/whipped cream) notes. It isn’t trying to smell like food, but rather like the idea of softness.',
    weight: 'Weightless, smooth, diffused.', secretWord: 'Proximity',
    secretText: 'These scents don’t shout; they whisper. They stay close to your body, making you smell "naturally" delicious.',
    bestFor: 'Intimate settings, office environments, or when you want to feel put-together without being "loud."',
  },
  {
    name: 'Crisp/Clean/Reset Button', color: 'var(--fam-aromatic)', title: 'The Crisp/Clean Vibe (The "Reset" Button)',
    logic: 'This is the most "structured" category. It relies on soap-like aldehydes, clean musk, and herbal notes. It aims for a "functional" smell—you want to smell like you just stepped out of a high-end spa, not like you’re wearing a bottle of perfume.',
    weight: 'Sharp, airy, vertical (it goes "up" instead of "out").', secretWord: 'Clarity',
    secretText: 'It removes the "fuzziness" of gourmands.',
    bestFor: 'Gym, running errands, or early morning meetings when you need to feel alert.',
  },
  {
    name: 'Effervescent/Active', color: 'var(--fam-citrus)', title: 'The Effervescent Vibe (The "Energy Spark")',
    logic: 'This is the most "vibrant" category. It uses ginger, mint, citrus, and crisp, sparkling aldehydes to create a sense of movement and "fizz." It isn’t trying to smell like food or a forest; it is designed to smell like a refreshing, high-energy tonic.',
    weight: 'Lightweight, bubbly, energetic.', secretWord: 'Radiance',
    secretText: 'Unlike heavy gourmands that "sit" on the skin, effervescent scents "bounce" off the skin. They create an invisible halo of freshness that makes you feel instantly more alert.',
    bestFor: 'High-energy errand days, shopping, summer brunch, or any time you need to "wake up" your mood and feel sharp and organized.',
  },
  {
    name: 'Fruit Orchard/Natural', color: 'var(--fam-green)', title: 'The Fruit Orchard Vibe (The "Natural" Vitality)',
    logic: 'This is "Real-Life" fruit. It’s not "candy" (which is artificial/sweet); it’s "juicy" (which is watery/natural). It uses stone fruits (peach, pear, apple, cherry) to add a dose of "bounced light" to your skin.',
    weight: 'Juicy, rounded, glowing.', secretWord: 'Juiciness',
    secretText: 'It needs to smell like the fruit was just cut.',
    bestFor: 'Day dates, brunch, or outdoor shopping where you want to appear approachable and energetic.',
  },
  {
    name: 'Spicy/Sophisticated', color: 'var(--fam-amber)', title: 'The Sophisticated/Spicy Vibe (The "Power" Play)',
    logic: 'This is the most complex category. It uses resinous amber, deep woods, and sharp spices (ginger, pepper) to create a scent that is "mysterious." It doesn’t tell a simple story; it’s an adult fragrance.',
    weight: 'Dense, slow-moving, long-lasting.', secretWord: 'Complexity',
    secretText: 'These perfumes have many layers, so they change smell throughout the day.',
    bestFor: 'Evening events, date nights, or leadership roles where you want to command the room.',
  },
  {
    name: 'Tropical/Escape', color: 'var(--fam-floral)', title: 'The Tropical Vibe (The "Escape" Mechanism)',
    logic: 'This is the only category that "transports" the wearer. It uses sun-warmed ingredients like coconut, mango, guava, and honeysuckle. It’s designed to counteract the feeling of being "stuck" in a routine.',
    weight: 'Sun-drenched, radiant, expansive.', secretWord: 'Projection',
    secretText: 'Tropical scents tend to project further because they are meant to mimic the smell of skin after a day in the sun and salt.',
    bestFor: 'Vacation, pool days, or those long Arizona afternoons when you wish you were on a beach.',
  },
];

export const DEFAULT_WISH_CATEGORIES = [
  'Travel Size', 'Full Size', 'Body Wash', 'Body Lotion', 'Body Mist', 'Body Oil', 'Perfume Oil',
];
```

- [ ] **Step 2: Write `app/stores/reference.ts`**

```typescript
import { defineStore } from 'pinia';
import { DEFAULT_LAYERS, DEFAULT_SCENTS, DEFAULT_VIBES, DEFAULT_WISH_CATEGORIES } from '~/utils/seedData';

export const useReferenceStore = defineStore('reference', () => {
  const layers = ref<any[]>([]);
  const vibes = ref<any[]>([]);
  const scents = ref<any[]>([]);
  const wishCategories = ref<any[]>([]);
  const loaded = ref(false);

  async function fetchAll() {
    const neon = useNeon();
    const [l, v, s, w] = await Promise.all([
      neon.from('layers').select('*').order('sort_order', { ascending: true }),
      neon.from('vibes').select('*').order('sort_order', { ascending: true }),
      neon.from('scents').select('*').order('name', { ascending: true }),
      neon.from('wish_categories').select('*').order('sort_order', { ascending: true }),
    ]);
    layers.value = l.data ?? [];
    vibes.value = v.data ?? [];
    scents.value = s.data ?? [];
    wishCategories.value = w.data ?? [];
  }

  async function seed() {
    const neon = useNeon();
    await neon.from('layers').insert(
      DEFAULT_LAYERS.map((l, i) => ({ key: l.key, label: l.label, short_label: l.shortLabel, sort_order: i }))
    );
    await neon.from('vibes').insert(
      DEFAULT_VIBES.map((v, i) => ({
        name: v.name, color: v.color, logic: v.logic, weight: v.weight,
        secret_word: v.secretWord, secret_text: v.secretText, best_for: v.bestFor, sort_order: i,
      }))
    );
    await neon.from('scents').insert(DEFAULT_SCENTS.map((s) => ({ name: s.name, layers: s.layers })));
    await neon.from('wish_categories').insert(
      DEFAULT_WISH_CATEGORIES.map((name, i) => ({ name, sort_order: i }))
    );
  }

  async function load() {
    await fetchAll();
    if (layers.value.length === 0) {
      await seed();
      await fetchAll();
    }
    loaded.value = true;
  }

  function scentsForLayer(layerKey: string): string[] {
    return scents.value.filter((s) => (s.layers || []).includes(layerKey)).map((s) => s.name);
  }

  function layerKeys(): string[] {
    return layers.value.map((l) => l.key);
  }

  return { layers, vibes, scents, wishCategories, loaded, load, scentsForLayer, layerKeys };
});
```

- [ ] **Step 3: Verify and commit**

Sign in as a fresh test user, call `await useReferenceStore().load()` twice via devtools console, then via `mcp__plugin_neon-plugin_neon__run_sql`: `SELECT count(*) FROM layers WHERE user_id = '<id>'` → must be 6 both times (not 12 after the second call).

```bash
git add app/utils/seedData.ts app/stores/reference.ts
git commit -m "feat: add reference-data store with first-login seeding"
```

```json:metadata
{"files": ["app/utils/seedData.ts", "app/stores/reference.ts"], "verifyCommand": "call reference.load() twice for a fresh user; SELECT count(*) FROM layers WHERE user_id = '<id>' via Neon MCP", "acceptanceCriteria": ["fresh user gets 6 layers/7 vibes/23 scents/7 wish_categories after first load()", "second load() does not duplicate rows", "scentsForLayer('bodyWash') returns the 9 seeded body-wash scents"], "estimatedScope": "medium"}
```

---

### Task 4: Combos / Notes / Wishlist stores

**Goal:** Build the three Pinia stores that back the app's core CRUD screens, talking to the Data API directly.

**Files:**
- Create: `app/stores/combos.ts`
- Create: `app/stores/notes.ts`
- Create: `app/stores/wishlist.ts`

**Acceptance Criteria:**
- [ ] `combos.create()`, `.update()`, `.delete()`, `.toggleFavorite()`, `.setRating()` round-trip through Neon and update local state
- [ ] `notes.create()`, `.update()`, `.delete()` round-trip through Neon
- [ ] `wishlist.setNote(category, text)` upserts (creates the row on first write, updates on subsequent writes) without ever creating a duplicate row for the same category
- [ ] All three stores' `load()` return only the signed-in user's rows (spot-checked against Task 1's RLS)

**Verify:** Manual devtools console round-trip for each store, cross-checked via `mcp__plugin_neon-plugin_neon__run_sql`.

**Steps:**

- [ ] **Step 1: `app/stores/combos.ts`**

```typescript
import { defineStore } from 'pinia';
import type { Combo } from '~/utils/olab';

export const useCombosStore = defineStore('combos', () => {
  const combos = ref<Combo[]>([]);
  const loaded = ref(false);

  async function load() {
    const neon = useNeon();
    const { data } = await neon.from('combos').select('*').order('created_at', { ascending: false });
    combos.value = (data ?? []).map(fromRow);
    loaded.value = true;
  }

  function fromRow(row: any): Combo {
    return {
      id: row.id, name: row.name, layers: row.layers ?? {}, season: row.season,
      highHeat: row.high_heat, vibe: row.vibe, favorite: row.favorite, rating: row.rating,
      longevity: row.longevity, projection: row.projection, note: row.note,
      history: row.history ?? [], photoKey: row.photo_key,
    };
  }

  function toRow(combo: Combo) {
    return {
      name: combo.name, layers: combo.layers, season: combo.season, high_heat: combo.highHeat,
      vibe: combo.vibe, favorite: combo.favorite, rating: combo.rating, longevity: combo.longevity,
      projection: combo.projection, note: combo.note, history: combo.history, photo_key: combo.photoKey,
      updated_at: new Date().toISOString(),
    };
  }

  async function save(combo: Combo): Promise<Combo> {
    const neon = useNeon();
    if (combo.id) {
      const { data } = await neon.from('combos').update(toRow(combo)).eq('id', combo.id).select().single();
      const saved = fromRow(data);
      combos.value = combos.value.map((c) => (c.id === saved.id ? saved : c));
      return saved;
    }
    const { data } = await neon.from('combos').insert(toRow(combo)).select().single();
    const saved = fromRow(data);
    combos.value = [saved, ...combos.value];
    return saved;
  }

  async function remove(id: string) {
    const neon = useNeon();
    await neon.from('combos').delete().eq('id', id);
    combos.value = combos.value.filter((c) => c.id !== id);
  }

  async function toggleFavorite(id: string) {
    const combo = combos.value.find((c) => c.id === id);
    if (!combo) return;
    await save({ ...combo, favorite: !combo.favorite });
  }

  async function setRating(id: string, rating: number) {
    const combo = combos.value.find((c) => c.id === id);
    if (!combo) return;
    await save({ ...combo, rating });
  }

  return { combos, loaded, load, save, remove, toggleFavorite, setRating };
});
```

- [ ] **Step 2: `app/stores/notes.ts`**

```typescript
import { defineStore } from 'pinia';

export interface Note {
  id: string | null;
  title: string;
  body: string;
  updatedOn: string;
}

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([]);
  const loaded = ref(false);

  function fromRow(row: any): Note {
    return { id: row.id, title: row.title, body: row.body, updatedOn: row.updated_on };
  }

  async function load() {
    const neon = useNeon();
    const { data } = await neon.from('notes').select('*').order('updated_on', { ascending: false });
    notes.value = (data ?? []).map(fromRow);
    loaded.value = true;
  }

  async function create() {
    const neon = useNeon();
    const { data } = await neon.from('notes').insert({ title: '', body: '' }).select().single();
    const note = fromRow(data);
    notes.value = [note, ...notes.value];
    return note;
  }

  async function update(id: string, patch: Partial<Pick<Note, 'title' | 'body'>>) {
    const neon = useNeon();
    const { data } = await neon
      .from('notes')
      .update({ ...patch, updated_on: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    const note = fromRow(data);
    notes.value = notes.value.map((n) => (n.id === note.id ? note : n));
  }

  async function remove(id: string) {
    const neon = useNeon();
    await neon.from('notes').delete().eq('id', id);
    notes.value = notes.value.filter((n) => n.id !== id);
  }

  return { notes, loaded, load, create, update, remove };
});
```

- [ ] **Step 3: `app/stores/wishlist.ts`**

```typescript
import { defineStore } from 'pinia';

export const useWishlistStore = defineStore('wishlist', () => {
  const notesByCategory = ref<Record<string, string>>({});
  const loaded = ref(false);

  async function load() {
    const neon = useNeon();
    const { data } = await neon.from('wishlist').select('category, note');
    const map: Record<string, string> = {};
    for (const row of data ?? []) map[row.category] = row.note;
    notesByCategory.value = map;
    loaded.value = true;
  }

  async function setNote(category: string, note: string) {
    const neon = useNeon();
    const { data: existing } = await neon.from('wishlist').select('id').eq('category', category);
    if (existing && existing.length > 0) {
      await neon.from('wishlist').update({ note }).eq('category', category);
    } else {
      await neon.from('wishlist').insert({ category, note });
    }
    notesByCategory.value = { ...notesByCategory.value, [category]: note };
  }

  return { notesByCategory, loaded, load, setNote };
});
```

- [ ] **Step 4: Verify and commit**

Devtools console: `const c = useCombosStore(); await c.load(); await c.save({id:null,name:'Test',layers:{},season:'Spring/Summer',highHeat:false,vibe:'',favorite:false,rating:0,longevity:0,projection:0,note:'',history:[],photoKey:null})`, confirm `c.combos` gets the new row with a real `id`. Repeat similarly for notes and wishlist. Cross-check row ownership via `mcp__plugin_neon-plugin_neon__run_sql`.

```bash
git add app/stores/combos.ts app/stores/notes.ts app/stores/wishlist.ts
git commit -m "feat: add combos/notes/wishlist Pinia stores over the Data API"
```

```json:metadata
{"files": ["app/stores/combos.ts", "app/stores/notes.ts", "app/stores/wishlist.ts"], "verifyCommand": "manual devtools CRUD round-trip per store, cross-checked via Neon MCP run_sql", "acceptanceCriteria": ["combos CRUD + toggleFavorite/setRating round-trip through Neon", "notes CRUD round-trips through Neon", "wishlist.setNote upserts without duplicating rows", "all three stores only ever see the signed-in user's own rows"], "estimatedScope": "medium"}
```

---

### Task 5: Auth screen + route guard

**Goal:** Build the sign-in/sign-up UI and gate the app behind it, running reference-data seeding right after first successful auth.

**Files:**
- Create: `app/components/AuthScreen.vue`
- Modify: `app/app.vue`

**Acceptance Criteria:**
- [ ] Unauthenticated users see `AuthScreen` (email/password fields, sign-in/sign-up toggle, "Continue with Google" button); authenticated users see the app placeholder
- [ ] Signing up or signing in transitions past the gate without a page reload
- [ ] `reference.load()` (and thus seeding) runs exactly once, right after the user becomes authenticated
- [ ] Reloading the page while signed in skips `AuthScreen` (session restored by `auth.init()`)

**Verify:** Manual — sign up, confirm placeholder renders; reload, confirm still signed in; sign out, confirm `AuthScreen` returns.

**Steps:**

- [ ] **Step 1: `app/components/AuthScreen.vue`**

```vue
<script setup lang="ts">
const mode = ref<'signIn' | 'signUp'>('signIn');
const email = ref('');
const password = ref('');
const name = ref('');
const error = ref('');
const busy = ref(false);
const auth = useAuthStore();

async function submit() {
  error.value = '';
  busy.value = true;
  const result =
    mode.value === 'signIn'
      ? await auth.signInEmail(email.value, password.value)
      : await auth.signUpEmail(email.value, password.value, name.value);
  busy.value = false;
  if (result.error) error.value = result.error.message;
}

async function google() {
  await auth.signInGoogle();
}
</script>

<template>
  <div style="min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px">
    <div style="width:100%; max-width:360px; background:var(--surface-2); border-radius:20px; box-shadow:inset 0 0 0 1px var(--hairline); padding:28px">
      <h1 style="margin:0 0 4px; font-family:var(--serif); font-size:26px; color:var(--text-hi)">MyOlfactoryLab</h1>
      <p style="margin:0 0 22px; font-size:13px; color:var(--text-dim)">
        {{ mode === 'signIn' ? 'Sign in to your lab.' : 'Create your lab account.' }}
      </p>

      <form @submit.prevent="submit" style="display:flex; flex-direction:column; gap:12px">
        <input
          v-if="mode === 'signUp'"
          v-model="name"
          placeholder="Name"
          style="padding:13px 15px; border-radius:12px; border:none; outline:none; background:var(--surface-1); box-shadow:inset 0 0 0 1px var(--hairline); color:var(--text-hi); font-size:15px"
        />
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          required
          style="padding:13px 15px; border-radius:12px; border:none; outline:none; background:var(--surface-1); box-shadow:inset 0 0 0 1px var(--hairline); color:var(--text-hi); font-size:15px"
        />
        <input
          v-model="password"
          type="password"
          placeholder="Password"
          required
          style="padding:13px 15px; border-radius:12px; border:none; outline:none; background:var(--surface-1); box-shadow:inset 0 0 0 1px var(--hairline); color:var(--text-hi); font-size:15px"
        />
        <p v-if="error" style="margin:0; color:var(--stat-neg); font-size:12.5px">{{ error }}</p>
        <button
          type="submit"
          :disabled="busy"
          style="padding:14px 20px; border-radius:14px; background:linear-gradient(180deg, var(--brass-bright), var(--brass)); color:#1a1305; font-weight:600; font-size:14.5px"
        >
          {{ mode === 'signIn' ? 'Sign In' : 'Create Account' }}
        </button>
      </form>

      <button
        @click="google"
        style="margin-top:12px; width:100%; padding:12px 16px; border-radius:13px; background:rgba(247,239,222,0.04); box-shadow:inset 0 0 0 1px var(--hairline); color:var(--text); font-size:13.5px"
      >
        Continue with Google
      </button>

      <button
        @click="mode = mode === 'signIn' ? 'signUp' : 'signIn'"
        style="margin-top:16px; width:100%; text-align:center; font-size:12.5px; color:var(--text-dim)"
      >
        {{ mode === 'signIn' ? "Need an account? Sign up" : 'Already have an account? Sign in' }}
      </button>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Update `app/app.vue`**

```vue
<script setup lang="ts">
const auth = useAuthStore();
const reference = useReferenceStore();

onMounted(async () => {
  await auth.init();
  if (auth.user) await reference.load();
});

watch(
  () => auth.user,
  async (user) => {
    if (user) await reference.load();
  }
);
</script>

<template>
  <div v-if="!auth.ready" />
  <AuthScreen v-else-if="!auth.user" />
  <div v-else style="padding: 40px; color: var(--text-hi); font-family: var(--serif)">
    Signed in as {{ auth.user.email }}. Full app shell built in Task 8.
  </div>
</template>
```

- [ ] **Step 3: Verify and commit**

Run `npm run dev`; sign up a fresh account; confirm the placeholder shows "Signed in as ..."; reload the page and confirm it skips straight to the placeholder (no `AuthScreen` flash beyond the initial `auth.init()` check); sign out via devtools (`useAuthStore().signOut()`) and confirm `AuthScreen` returns.

```bash
git add app/components/AuthScreen.vue app/app.vue
git commit -m "feat: add auth screen and route guard with first-login seeding"
```

```json:metadata
{"files": ["app/components/AuthScreen.vue", "app/app.vue"], "verifyCommand": "manual: sign up, reload, sign out — confirm gate behavior each time", "acceptanceCriteria": ["unauthenticated users see AuthScreen with email/password + Google", "successful auth transitions past the gate without reload", "reference.load() runs once right after auth", "session survives a page reload"], "estimatedScope": "small"}
```

---

### Task 6: Icon + UI primitives port

**Goal:** Port `icons.jsx` and `ui.jsx` to Vue, establishing the JSX→Vue conversion pattern the remaining UI-port tasks follow.

**Files:**
- Create: `app/components/Icon.vue`
- Create: `app/components/ui/DropPhoto.vue`
- Create: `app/components/ui/VibeTag.vue`
- Create: `app/components/ui/RatingStars.vue`
- Create: `app/components/ui/HeartButton.vue`
- Create: `app/components/ui/CheckBox.vue`
- Create: `app/components/ui/Toggle.vue`
- Create: `app/components/ui/Dropdown.vue`
- Create: `app/components/ui/TextArea.vue`
- Create: `app/components/ui/Input.vue`
- Create: `app/components/ui/Seg.vue`
- Create: `app/components/ui/Chip.vue`
- Create: `app/components/ui/SectionHeader.vue`
- Create: `app/components/ui/PrimaryButton.vue`
- Create: `app/components/ui/GhostButton.vue`
- Create: `app/components/ui/IconButton.vue`
- Create: `app/components/ui/Rule.vue`
- Create: `app/components/ui/Panel.vue`

**Acceptance Criteria:**
- [ ] Every icon name used elsewhere in the design (`rack`, `bookmark`, `plus`, `chart`, `note`, `heart`, `star`, `camera`, `flame`, `sun`, `leaf`, `check`, `close`, `chevronDown`, etc.) renders correctly via `<Icon :name="..." />`
- [ ] `DropPhoto` uploads via `POST {uploadEndpoint}` (stubbed until Task 9) instead of writing to `localStorage`, and displays `{R2_PUBLIC_URL}/{key}` when a `photoKey` prop is set
- [ ] `Dropdown` supports single-select, multi-select (`multi` prop, chip removal), and `allowCustom` (inline "Add custom…" input) exactly as in the design
- [ ] A manual smoke page (e.g. temporarily mounting a few primitives in `app.vue`) confirms visual fidelity to the design's screenshots (`screenshots/combos-v2.png`, `screenshots/editor-vibe.png` in the design project) before moving on

**Verify:** Manual visual check against the design screenshots; `npx vitest run` still passes (no regressions).

**Steps:**

- [ ] **Step 1: `app/components/Icon.vue` — full conversion example**

This establishes the pattern: static JSX shape data becomes a lookup table of raw SVG-fragment strings (safe here — every value is a hardcoded literal, never user input), rendered via a single `v-html`. `stroke-width` is set once on the root `<svg>` and inherits down to children (SVG's `stroke-width` is CSS-inheritable), reproducing the original per-shape `{...p}` spread with one assignment instead of one per icon.

```vue
<script setup lang="ts">
const props = withDefaults(
  defineProps<{ name: string; size?: number; stroke?: number; fill?: boolean }>(),
  { size: 24, stroke: 1.6, fill: false }
);

const S = 'fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"';

// Verbatim transcription of icons.jsx's `paths` map (JSX -> inner SVG markup).
const STATIC_PATHS: Record<string, string> = {
  droplet: `<path ${S} d="M12 3.2C12 3.2 5.5 10 5.5 14.5a6.5 6.5 0 0013 0C18.5 10 12 3.2 12 3.2z" />`,
  rack: `<g ${S}><rect x="5" y="3.5" width="3.4" height="11" rx="0.8" /><rect x="10.3" y="3.5" width="3.4" height="11" rx="0.8" /><rect x="15.6" y="3.5" width="3.4" height="11" rx="0.8" /><path d="M3.5 16.5h17M5.5 16.5l1 4h11l1-4" /></g>`,
  beaker: `<g ${S}><path d="M9 3h6M10 3v6.5L5.6 17.4A2 2 0 007.4 20.5h9.2a2 2 0 001.8-3.1L14 9.5V3" /><path d="M7.7 14h8.6" /></g>`,
  bookmark: `<path ${S} d="M6.5 4.5h11a1 1 0 011 1v14l-6.5-4-6.5 4v-14a1 1 0 011-1z" />`,
  more: `<g ${S}><circle cx="5.5" cy="12" r="1.3" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" /><circle cx="18.5" cy="12" r="1.3" fill="currentColor" stroke="none" /></g>`,
  plus: `<path ${S} d="M12 5v14M5 12h14" />`,
  close: `<path ${S} d="M6 6l12 12M18 6L6 18" />`,
  chevronRight: `<path ${S} d="M9 5l7 7-7 7" />`,
  chevronLeft: `<path ${S} d="M15 5l-7 7 7 7" />`,
  chevronDown: `<path ${S} d="M5 9l7 7 7-7" />`,
  arrowRight: `<path ${S} d="M4 12h15M13 6l6 6-6 6" />`,
  arrowUp: `<path ${S} d="M12 19V5M6 11l6-6 6 6" />`,
  check: `<path ${S} d="M5 12.5l4.5 4.5L19 6.5" />`,
  regenerate: `<g ${S}><path d="M20 11a8 8 0 10-1.6 5.4" /><path d="M20 4v5h-5" /></g>`,
  lock: `<g ${S}><rect x="5.5" y="10.5" width="13" height="9" rx="2" /><path d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5" /></g>`,
  unlock: `<g ${S}><rect x="5.5" y="10.5" width="13" height="9" rx="2" /><path d="M8.5 10.5V8a3.5 3.5 0 016.9-1" /></g>`,
  edit: `<path ${S} d="M16.5 4.5l3 3L9 18l-4 1 1-4 10.5-10.5zM14.5 6.5l3 3" />`,
  search: `<g ${S}><circle cx="11" cy="11" r="6" /><path d="M15.5 15.5L20 20" /></g>`,
  filter: `<path ${S} d="M4 6h16M7 12h10M10 18h4" />`,
  sort: `<path ${S} d="M4 7h10M4 12h7M4 17h4M16 5v14M16 19l3-3M16 19l-3-3" />`,
  grid: `<g ${S}><rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" /></g>`,
  list: `<path ${S} d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />`,
  calendar: `<g ${S}><rect x="4" y="5.5" width="16" height="15" rx="2" /><path d="M4 9.5h16M8 3.5v4M16 3.5v4" /></g>`,
  gift: `<g ${S}><rect x="4" y="9" width="16" height="11" rx="1.5" /><path d="M4 13h16M12 9v11M12 9s-1.2-4-3.6-4A2.4 2.4 0 008.4 9zM12 9s1.2-4 3.6-4A2.4 2.4 0 0115.6 9z" /></g>`,
  chart: `<g ${S}><path d="M4 20h16" /><rect x="6" y="12" width="3" height="6" rx="0.6" /><rect x="11" y="8" width="3" height="10" rx="0.6" /><rect x="16" y="14" width="3" height="4" rx="0.6" /></g>`,
  gear: `<g ${S}><circle cx="12" cy="12" r="3" /><path d="M12 2.8v2.4M12 18.8v2.4M21.2 12h-2.4M5.2 12H2.8M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7M18.5 18.5l-1.7-1.7M7.2 7.2L5.5 5.5" /></g>`,
  flask: `<g ${S}><path d="M10 3h4M11 3v5.5L6.4 17a2.2 2.2 0 002 3.3h7.2a2.2 2.2 0 002-3.3L13 8.5V3" /><circle cx="11" cy="14.5" r="0.8" fill="currentColor" stroke="none" /><circle cx="14" cy="16.5" r="0.6" fill="currentColor" stroke="none" /></g>`,
  waves: `<path ${S} d="M3 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />`,
  info: `<g ${S}><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 8h.01" /></g>`,
  bell: `<g ${S}><path d="M6 16V11a6 6 0 1112 0v5l1.5 2.5h-15L6 16z" /><path d="M10 20a2 2 0 004 0" /></g>`,
  target: `<g ${S}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3.4" /><path d="M12 1.5v3M12 19.5v3M22.5 12h-3M4.5 12h-3" /></g>`,
  drop_log: `<g ${S}><path d="M12 3.5C12 3.5 6.5 9.5 6.5 13.7a5.5 5.5 0 0011 0C17.5 9.5 12 3.5 12 3.5z" /><path d="M9.5 14l1.8 1.8L15 12.3" /></g>`,
  camera: `<g ${S}><path d="M4 8.5h3l1.3-2h7.4L17 8.5h3a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1v-8a1 1 0 011-1z" /><circle cx="12" cy="13" r="3.2" /></g>`,
  nose: `<path ${S} d="M12 4v6c0 1.5-1 2-1 3.5M9 16c-1.5-.5-2.5-2-2-4M12 4c2.5 1.5 4 4 4 7.5a4.5 4.5 0 01-9 0M9.5 16.5a3 3 0 005 0" />`,
  flame: `<path ${S} d="M12 3s5 4 5 9a5 5 0 01-10 0c0-1.6.7-2.9 1.5-3.8 0 1.3 1 2.3 2 2.3 1.3 0 1.6-1.4 1-2.8-.7-1.6-.5-3.6.5-4.9z" />`,
  sun: `<g ${S}><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2.4M12 19.1v2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7" /></g>`,
  leaf: `<path ${S} d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14zM5 19c3.5-4 6.5-6 10-8" />`,
  trash: `<g ${S}><path d="M4.5 6.5h15M9 6.5V5a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0115 5v1.5M6.5 6.5l1 12a1.5 1.5 0 001.5 1.4h6a1.5 1.5 0 001.5-1.4l1-12" /><path d="M10 10.5v6M14 10.5v6" /></g>`,
  tag: `<g ${S}><path d="M4 12.5V5.5a1.5 1.5 0 011.5-1.5h7l7.5 7.5a1.5 1.5 0 010 2.1l-6.9 6.9a1.5 1.5 0 01-2.1 0L4 12.5z" /><circle cx="8.5" cy="8.5" r="1.3" fill="currentColor" stroke="none" /></g>`,
  note: `<g ${S}><path d="M6 3.5h9L19 7.5v11a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 015 18.5V5A1.5 1.5 0 016 3.5z" /><path d="M14 3.5V8h4.5M8.5 12.5h7M8.5 16h5" /></g>`,
  save: `<g ${S}><path d="M5 4.5h11l3 3V18a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 015 18V6a1.5 1.5 0 010-1.5z" /><path d="M8 4.5v4h6v-4M8 19.5v-5h8v5" /></g>`,
};

const inner = computed(() => {
  if (props.name === 'heart') {
    return `<path fill="${props.fill ? 'currentColor' : 'none'}" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M12 20s-7-4.6-7-9.4A3.9 3.9 0 0112 8a3.9 3.9 0 017 2.6C19 15.4 12 20 12 20z" />`;
  }
  if (props.name === 'star') {
    return `<path fill="${props.fill ? 'currentColor' : 'none'}" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8L3.5 9.7l5.9-.9L12 3.5z" />`;
  }
  return STATIC_PATHS[props.name] ?? '';
});
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    :style="{ display: 'block', flexShrink: 0, strokeWidth: stroke }"
    v-html="inner"
  />
</template>
```

- [ ] **Step 2: Port `ui.jsx` primitives**

Fetch `ui.jsx` via `DesignSync get_file` (project `db62da18-beaa-497c-a67a-0a5f79ced62d`) and port each exported function to its own SFC under `app/components/ui/`, following these rules consistently:
- React inline `style={{...}}` objects → Vue `:style="{...}"` bindings (camelCase keys stay the same — Vue accepts camelCase style keys).
- `onClick`/`onChange`/`onDragOver`/etc. → `@click`/`@change`/`@dragover` (kebab or camel both work; match the design's existing casing where mixed-case Vue events are ambiguous, e.g. `@dragover.prevent`).
- `useState` → `ref()`; derived values computed inline in JSX → `computed()`.
- Controlled-input props (`value`/`onChange`) → `defineProps<{ modelValue: ... }>()` + `defineEmits<{ 'update:modelValue': [...] }>()`, used with `v-model` at call sites (this is the idiomatic Vue equivalent and keeps call sites just as terse as the JSX originals).
- Children (`{children}`) → `<slot />`.
- The **one** exception: `OLPhotos` (a module-level localStorage-backed photo cache with pub/sub) is NOT ported as-is — `DropPhoto.vue` instead takes a `photoKey: string | null` prop and a `combo-id` prop, and calls `POST {runtimeConfig.public.uploadEndpoint}` with `Authorization: Bearer <jwt from useAuthStore/useNeon session>` on file drop/select, emitting `update:photoKey` with the returned key. Image display becomes `:src="photoKey ? \`\${r2PublicUrl}/\${photoKey}\` : undefined"`. (The actual upload endpoint is stubbed to return a fixed fake key in this task — Task 9 makes it real.)

- [ ] **Step 3: Manual visual smoke test**

Temporarily mount 3-4 primitives (e.g. `PrimaryButton`, `Chip`, `RatingStars`, `Dropdown`) in `app/app.vue`'s signed-in branch, run `npm run dev`, and visually compare against the design's `screenshots/combos-v2.png` / `screenshots/editor-vibe.png` (fetch via `DesignSync get_file` if not already visible). Remove the temporary mount once confirmed — the real screens replace it in Task 8.

- [ ] **Step 4: Verify and commit**

Run: `npx vitest run` (no regressions) and the manual visual check from Step 3.

```bash
git add app/components/Icon.vue app/components/ui
git commit -m "feat: port icon set and shared UI primitives to Vue"
```

```json:metadata
{"files": ["app/components/Icon.vue", "app/components/ui/DropPhoto.vue", "app/components/ui/VibeTag.vue", "app/components/ui/RatingStars.vue", "app/components/ui/HeartButton.vue", "app/components/ui/CheckBox.vue", "app/components/ui/Toggle.vue", "app/components/ui/Dropdown.vue", "app/components/ui/TextArea.vue", "app/components/ui/Input.vue", "app/components/ui/Seg.vue", "app/components/ui/Chip.vue", "app/components/ui/SectionHeader.vue", "app/components/ui/PrimaryButton.vue", "app/components/ui/GhostButton.vue", "app/components/ui/IconButton.vue", "app/components/ui/Rule.vue", "app/components/ui/Panel.vue"], "verifyCommand": "npx vitest run; manual visual check against design screenshots", "acceptanceCriteria": ["every icon name used elsewhere in the design renders", "DropPhoto uploads via the upload endpoint and displays via R2 public URL + photoKey", "Dropdown supports single/multi/allowCustom exactly as the design", "primitives visually match the design screenshots"], "estimatedScope": "large"}
```

---

### Task 7: ComboCard + five screens port

**Goal:** Port `cards.jsx`, `screens.jsx`, and `screens2.jsx` to Vue, producing the five screen components the app shell (Task 8) will route between.

**Files:**
- Create: `app/components/cards/ComboCard.vue`
- Create: `app/components/screens/CombosScreen.vue`
- Create: `app/components/screens/ComboEditorScreen.vue`
- Create: `app/components/screens/WishListScreen.vue`
- Create: `app/components/screens/ReportScreen.vue`
- Create: `app/components/screens/NotesScreen.vue`

**Acceptance Criteria:**
- [ ] `ComboCard` renders the photo (via the ported `DropPhoto`), vibe accent bar, heart button, last-used stamp, title, rating stars, season/heat/usage badges, longevity/projection meters, and up-to-3 filled-layer summary chips — matching `cards.jsx`
- [ ] `CombosScreen` lists `ComboCard`s for the signed-in user's combos (from `useCombosStore`), supports opening a combo and creating a new one
- [ ] `ComboEditorScreen` edits every field on `Combo` (name, per-layer scent pickers sourced from `useReferenceStore().scentsForLayer(key)` with `allowCustom`, season, high-heat, vibe, rating, longevity, projection, note, photo) and calls `combos.save()` / `combos.remove()`
- [ ] `WishListScreen` renders one note field per `useReferenceStore().wishCategories`, backed by `useWishlistStore()`
- [ ] `ReportScreen` shows usage analytics per combo using `usageCounts`/`lastUsedMono` from `app/utils/olab.ts`
- [ ] `NotesScreen` lists/creates/edits/deletes notes via `useNotesStore()`

**Verify:** Manual — temporarily route to each screen from `app.vue` (real wiring happens in Task 8) and exercise its core interaction (open a combo, save an edit, toggle a wishlist note, add/delete a general note).

**Steps:**

- [ ] **Step 1: Port `cards.jsx` → `app/components/cards/ComboCard.vue`**

Content already read in full during planning (`cards.jsx`: `ComboCard`, `MetaBadge`, `MiniMeter`, `seasonIcon`). Port `MetaBadge`/`MiniMeter`/`seasonIcon` as local helpers inside `ComboCard.vue` (script-level function + a tiny inline sub-template each, or split into `MetaBadge.vue`/`MiniMeter.vue` under the same folder if that reads cleaner — either is fine, they're only used here). Apply the same conversion rules as Task 6. Replace direct `LAYER_KEYS`/`LAYER_SHORT`/`VIBES` global lookups with props/store access: `ComboCard` takes `combo: Combo` and reads `useReferenceStore()` for `layerKeys()`/short labels/vibe color, and calls `filledLayers`/`comboTitle`/`usageCounts`/`lastUsedMono`/`layerArr`/`history` from `~/utils/olab`.

- [ ] **Step 2: Fetch and port `screens.jsx` and `screens2.jsx`**

Fetch both via `DesignSync get_file` (project `db62da18-beaa-497c-a67a-0a5f79ced62d`) — not yet read during planning; they contain `CombosScreen`, `ComboEditorScreen`, `WishListScreen`, `ReportScreen`, `NotesScreen` (per the screen-selection logic already seen in `app.jsx`: `screen = tab === 'combos' ? <CombosScreen combos onOpen onNew onToggleFav onSetRating /> : tab === 'wish' ? <WishListScreen wishlist onChange /> : tab === 'report' ? <ReportScreen combos onOpen /> : tab === 'notes' ? <NotesScreen notes onAdd onUpdate onDelete /> : <ComboEditorScreen combo isNew onBack onSave onDelete />`). Port each following the Task 6 conversion rules, replacing prop-drilled data/callbacks with the matching Pinia store:

| Design prop | Vue replacement |
|---|---|
| `combos` | `useCombosStore().combos` |
| `onOpen(id)` | local `openCombo(id)` emits `open-combo` (parent in Task 8 sets `editor` state) or, simpler, use Nuxt's client-only routing state directly in `app.vue` — keep these as `defineEmits` so screens stay presentation-only and don't own navigation |
| `onNew()` | `defineEmits<{ new: [] }>()` |
| `onToggleFav(id)` | `useCombosStore().toggleFavorite(id)` called directly (store mutation, not prop-drilled) |
| `onSetRating(id, n)` | `useCombosStore().setRating(id, n)` called directly |
| `wishlist`, `onChange` | `useWishlistStore().notesByCategory` / `.setNote()` called directly |
| `notes`, `onAdd/onUpdate/onDelete` | `useNotesStore()` called directly |
| `combo`, `isNew`, `onSave`, `onDelete` | local `ref<Combo>` seeded from `newCombo(reference.layerKeys())` or the opened combo; `onSave` → `useCombosStore().save(draft)`; `onDelete` → `useCombosStore().remove(id)`; `onBack` stays a `defineEmits<{ back: [] }>()` since navigation is the parent's job |

Where the design used the global `SCENT_LIBRARY[layerKey]` for a layer's dropdown options, use `useReferenceStore().scentsForLayer(layerKey)` instead (per-user editable data, per the approved design). Where it used the global `VIBES` map, use `useReferenceStore().vibes`.

- [ ] **Step 3: Manual verification**

Temporarily wire each screen into `app.vue`'s signed-in branch behind a simple `ref` tab switch (throwaway — Task 8 replaces this with the real `TabBar`), run `npm run dev`, and confirm: open the Combos list, create+save a new combo with at least two layers filled, edit an existing combo's rating, toggle a wishlist category note, add and delete a general note, and confirm the Report screen reflects the combo's `history`.

- [ ] **Step 4: Commit**

```bash
git add app/components/cards app/components/screens
git commit -m "feat: port ComboCard and the five app screens to Vue"
```

```json:metadata
{"files": ["app/components/cards/ComboCard.vue", "app/components/screens/CombosScreen.vue", "app/components/screens/ComboEditorScreen.vue", "app/components/screens/WishListScreen.vue", "app/components/screens/ReportScreen.vue", "app/components/screens/NotesScreen.vue"], "verifyCommand": "manual: exercise each screen's core interaction via a throwaway tab switch in app.vue", "acceptanceCriteria": ["ComboCard matches cards.jsx (photo, vibe bar, heart, last-used stamp, rating, badges, meters, layer chips)", "CombosScreen lists/opens/creates combos from useCombosStore", "ComboEditorScreen edits every Combo field and saves/deletes via the store", "WishListScreen edits one note per reference wish category", "ReportScreen shows usage analytics via olab.ts helpers", "NotesScreen lists/creates/edits/deletes via useNotesStore"], "estimatedScope": "large"}
```

---

### Task 8: App shell — TabBar, Toast, navigation

**Goal:** Assemble the final `app.vue` root shell from `app.jsx`'s logic (tab bar, editor overlay, toast), replacing the throwaway wiring from Task 7.

**Files:**
- Create: `app/components/TabBar.vue`
- Create: `app/components/Toast.vue`
- Modify: `app/app.vue`

**Acceptance Criteria:**
- [ ] Bottom tab bar with 5 items (Combos, Wish List, **New** center action, Report, Notes) matches `app.jsx`'s `TABS`/`TabBar`, including the raised circular "New" button
- [ ] Tapping a tab switches screens; tapping "New" opens `ComboEditorScreen` in create mode; the tab bar hides while the editor is open (`navHidden` behavior from the design)
- [ ] Saving/deleting a combo shows a toast (`Saved — {title}` / `Deleted — {title}`) that auto-dismisses (~1.9s), matching `app.jsx`
- [ ] Saving a combo from a non-Combos tab returns focus to the Combos tab (matches `app.jsx`'s `saveCombo`)
- [ ] Full flow works end-to-end: sign in → land on Combos → tap New → fill in a combo → Save → toast appears → back on Combos tab → new card visible

**Verify:** Manual full-flow walkthrough per the last acceptance criterion above.

**Steps:**

- [ ] **Step 1: `app/components/TabBar.vue`**

Port `app.jsx`'s `TABS` array and `TabBar` function directly (already read in full during planning) — `props: { active: string }`, `emits: { change: [tab: string]; new: [] }`. Same conversion rules as Task 6 (inline styles → `:style`, `onClick` → `@click`).

- [ ] **Step 2: `app/components/Toast.vue`**

Port the toast `<div>` block from `app.jsx`'s `App` render (the `{toast && (...)}` section) as a standalone component: `props: { message: string | null }`, self-contained fade-up animation via the `ol-fade-up` keyframe already in `app/assets/theme.css` (Task 0).

- [ ] **Step 3: Rewrite `app/app.vue`**

Port `app.jsx`'s `App` function's navigation/editor/toast state machine (drop `usePersist`/localStorage — state now lives in the Pinia stores; drop `scale`/`IOSDevice`/`TweaksPanel` — dropped per the approved design):

```vue
<script setup lang="ts">
import type { Combo } from '~/utils/olab';
import { comboTitle } from '~/utils/olab';

const auth = useAuthStore();
const reference = useReferenceStore();
const combos = useCombosStore();
const notes = useNotesStore();
const wishlist = useWishlistStore();

const tab = ref<'combos' | 'wish' | 'report' | 'notes'>('combos');
const editor = ref<{ combo: Combo; isNew: boolean } | null>(null);
const toast = ref<string | null>(null);
let toastTimer: ReturnType<typeof setTimeout> | null = null;

function showToast(msg: string) {
  toast.value = msg;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.value = null), 1900);
}

async function bootstrapData() {
  await Promise.all([reference.load(), combos.load(), notes.load(), wishlist.load()]);
}

onMounted(async () => {
  await auth.init();
  if (auth.user) await bootstrapData();
});

watch(
  () => auth.user,
  async (user) => {
    if (user) await bootstrapData();
  }
);

function openNew() {
  editor.value = { combo: newCombo(reference.layerKeys()), isNew: true };
}
function openCombo(id: string) {
  const c = combos.combos.find((x) => x.id === id);
  if (c) editor.value = { combo: c, isNew: false };
}
function closeEditor() {
  editor.value = null;
}
async function saveCombo(draft: Combo) {
  await combos.save(draft);
  editor.value = null;
  if (tab.value !== 'combos') tab.value = 'combos';
  showToast(`Saved — ${comboTitle(draft, reference.layerKeys())}`);
}
async function deleteCombo(id: string) {
  const title = comboTitle(combos.combos.find((c) => c.id === id) ?? draftFallback(), reference.layerKeys());
  await combos.remove(id);
  editor.value = null;
  showToast(`Deleted — ${title}`);
}
function draftFallback(): Combo {
  return newCombo(reference.layerKeys());
}

const navHidden = computed(() => !!editor.value);
</script>

<template>
  <div v-if="!auth.ready" />
  <AuthScreen v-else-if="!auth.user" />
  <div v-else style="min-height:100vh; display:flex; flex-direction:column; position:relative">
    <div style="flex:1; min-height:0; display:flex; flex-direction:column">
      <ComboEditorScreen
        v-if="editor"
        :combo="editor.combo"
        :is-new="editor.isNew"
        @back="closeEditor"
        @save="saveCombo"
        @delete="deleteCombo"
      />
      <CombosScreen v-else-if="tab === 'combos'" @open="openCombo" @new="openNew" />
      <WishListScreen v-else-if="tab === 'wish'" />
      <ReportScreen v-else-if="tab === 'report'" @open="openCombo" />
      <NotesScreen v-else-if="tab === 'notes'" />
    </div>
    <TabBar v-if="!navHidden" :active="tab" @change="(t) => (tab = t)" @new="openNew" />
    <Toast :message="toast" />
  </div>
</template>
```

- [ ] **Step 4: Full-flow verification**

Run `npm run dev`: sign in → confirm Combos tab renders → tap the center "New" button → fill in a name, pick at least two layer scents, set a vibe and rating → Save → confirm the toast reads `Saved — <name>` → confirm you land back on Combos with the new card visible → open it again, delete it → confirm the `Deleted — <name>` toast and the card is gone.

- [ ] **Step 5: Commit**

```bash
git add app/components/TabBar.vue app/components/Toast.vue app/app.vue
git commit -m "feat: assemble app shell — tab bar, toast, navigation state"
```

```json:metadata
{"files": ["app/components/TabBar.vue", "app/components/Toast.vue", "app/app.vue"], "verifyCommand": "manual full-flow: sign in -> new combo -> save -> toast -> visible in list -> open -> delete -> toast", "acceptanceCriteria": ["5-item tab bar with raised center New button matches app.jsx", "tapping New opens the editor and hides the tab bar", "save/delete show an auto-dismissing toast with the combo title", "saving from a non-Combos tab returns to Combos", "full create -> save -> list -> delete flow works end-to-end"], "estimatedScope": "medium"}
```

---

### Task 9: Photo storage — Cloudflare Pages Function + R2

**Goal:** Replace the Task 6 stub upload endpoint with a real Cloudflare Pages Function that verifies the caller's Neon Auth JWT and writes/deletes objects in R2.

**Files:**
- Create: `functions/api/photos.ts`
- Modify: `app/components/ui/DropPhoto.vue` (point at the real endpoint — likely already correct from Task 6, verify only)

**Acceptance Criteria:**
- [ ] `POST /api/photos` with a valid JWT and an image body stores the object at `photos/{user_id}/{combo_id}-{random}` in the `PHOTOS` R2 binding and returns `{ key }`
- [ ] `POST /api/photos` with no/invalid JWT returns 401 and writes nothing
- [ ] `DELETE /api/photos?key=...` with a valid JWT for the owning user deletes the object; deleting a key under a different user's prefix returns 403
- [ ] Uploaded photos render via `{R2_PUBLIC_URL}/{key}` with no additional request to the Function

**Verify:** `npx wrangler pages dev` locally (or deploy to a preview) — `curl -X POST .../api/photos` without auth → 401; with a valid JWT + image body → 200 `{key}`; fetch that key from the R2 public URL → image bytes back.

**Steps:**

- [ ] **Step 1: Write `functions/api/photos.ts`**

```typescript
interface Env {
  PHOTOS: R2Bucket;
  NEON_JWKS_URL: string;
}

async function verifyUserId(request: Request, env: Env): Promise<string | null> {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice('Bearer '.length);

  // Minimal JWT verification against Neon Auth's JWKS: decode header to find `kid`,
  // fetch the matching JWK, verify the RS256 signature, then read the `sub` claim.
  const [headerB64, payloadB64, signatureB64] = token.split('.');
  if (!headerB64 || !payloadB64 || !signatureB64) return null;

  const header = JSON.parse(atob(headerB64.replace(/-/g, '+').replace(/_/g, '/')));
  const jwksRes = await fetch(env.NEON_JWKS_URL);
  const jwks = await jwksRes.json<{ keys: JsonWebKey[] }>();
  const jwk = (jwks.keys as any[]).find((k) => k.kid === header.kid);
  if (!jwk) return null;

  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const signature = Uint8Array.from(atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
  const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, signature, data);
  if (!valid) return null;

  const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
  if (payload.exp && Date.now() / 1000 > payload.exp) return null;
  return payload.sub ?? null;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const userId = await verifyUserId(request, env);
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const url = new URL(request.url);
  const comboId = url.searchParams.get('comboId') ?? 'combo';
  const contentType = request.headers.get('Content-Type') ?? 'application/octet-stream';
  const ext = contentType.split('/')[1]?.split('+')[0] ?? 'bin';
  const key = `photos/${userId}/${comboId}-${crypto.randomUUID()}.${ext}`;

  await env.PHOTOS.put(key, request.body, { httpMetadata: { contentType } });
  return Response.json({ key });
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  const userId = await verifyUserId(request, env);
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const key = new URL(request.url).searchParams.get('key');
  if (!key) return new Response('Missing key', { status: 400 });
  if (!key.startsWith(`photos/${userId}/`)) return new Response('Forbidden', { status: 403 });

  await env.PHOTOS.delete(key);
  return new Response(null, { status: 204 });
};
```

- [ ] **Step 2: Verify `DropPhoto.vue`'s upload call**

Confirm it POSTs to `useRuntimeConfig().public.uploadEndpoint` with `Authorization: Bearer <token>` (from `(await useNeon().auth.getSession()).data.session.token` or the SDK's exposed access token — check the actual field name in `@neondatabase/neon-js`'s session shape) and the raw file body, `?comboId=<id>` in the query string, and stores the returned `key` via `update:photoKey`. Fix if the stub from Task 6 diverges.

- [ ] **Step 3: Local verification**

This requires Cloudflare account access the agent doesn't have — hand off to the user for the actual R2 bucket binding (see Task 10's "what you need to set up"). Verify what's controllable locally: `npx wrangler pages dev .output/public` (after `npm run generate`) with a local R2 binding stub if `wrangler.toml`/`.dev.vars` are configured, or defer full verification to Task 10's end-to-end check once the real binding exists.

- [ ] **Step 4: Commit**

```bash
git add functions/api/photos.ts app/components/ui/DropPhoto.vue
git commit -m "feat: add Cloudflare Pages Function for R2 photo upload/delete"
```

```json:metadata
{"files": ["functions/api/photos.ts", "app/components/ui/DropPhoto.vue"], "verifyCommand": "curl-based auth checks locally where possible; full R2 round-trip verified in Task 10 after the user binds the bucket", "acceptanceCriteria": ["valid JWT + image body stores an object under photos/{user_id}/... and returns {key}", "missing/invalid JWT returns 401 and writes nothing", "DELETE with a foreign user's key prefix returns 403", "uploaded photos render via the R2 public URL directly"], "estimatedScope": "medium"}
```

---

### Task 10: Deploy — GitHub, Cloudflare Pages, trusted origins, end-to-end verification

**Goal:** Get the app live on Cloudflare Pages via GitHub, connect the real R2 bucket, and verify the whole system end-to-end.

**Files:**
- Modify: `README.md`
- Modify: `.env.example` (if any keys were missed)

**Acceptance Criteria:**
- [ ] Code is pushed to a GitHub repo
- [ ] Cloudflare Pages project builds `npm run generate` and serves `.output/public`
- [ ] `functions/api/photos.ts` is live and bound to the real R2 bucket as `PHOTOS`, with `NEON_JWKS_URL` set
- [ ] The deployed Pages URL is added to Neon Auth's `trusted_origins`
- [ ] Two separate test accounts each see only their own combos/notes/wishlist (RLS re-verified against the deployed app, not just local dev)
- [ ] The deployed app installs cleanly as an iOS WebClip (Add to Home Screen) and runs full-screen with no browser chrome

**Verify:** Full checklist above, executed against the live Cloudflare Pages URL.

**Steps:**

- [ ] **Step 1: What the user needs to do first (blocking)**

Confirm with the user, then wait for:
1. A GitHub repo to push to (or approval to create one via `gh repo create`).
2. A Cloudflare Pages project connected to that repo — build command `npm run generate`, output directory `.output/public`.
3. The R2 bucket name behind `https://pub-710fd787dd2041be8437c5820397bcec.r2.dev`, bound to the Pages project as `PHOTOS`.
4. `NEON_JWKS_URL` set as a Pages environment variable: `https://ep-dark-meadow-atpy3tcm.neonauth.c-9.us-east-1.aws.neon.tech/neondb/auth/.well-known/jwks.json`.
5. The four `NUXT_PUBLIC_*` values from `.env.example` set as Pages build environment variables.

- [ ] **Step 2: Push to GitHub**

```bash
git remote add origin <repo-url>   # if not already set
git push -u origin main
```

- [ ] **Step 3: Add the deployed origin to Neon Auth trusted origins**

Once the user shares the Pages URL, use `mcp__plugin_neon-plugin_neon__configure_neon_auth` (project `morning-tooth-46552476`) to add it to `trusted_origins` (keep `localhost` allowed for continued local dev).

- [ ] **Step 4: End-to-end RLS re-verification on the deployed app**

Sign up two separate accounts on the live URL, create at least one combo/note/wishlist entry per account, and confirm via `mcp__plugin_neon-plugin_neon__run_sql` that each user's rows have the correct distinct `user_id`, and via the UI that neither account can see the other's data.

- [ ] **Step 5: Photo round-trip on the deployed app**

Add a combo photo through the live UI; confirm via Cloudflare's R2 dashboard (or ask the user to confirm) that the object lands under `photos/{user_id}/...`; confirm it renders; delete the combo and confirm the object is removed.

- [ ] **Step 6: WebClip verification**

On an iOS device, open the deployed URL in Safari, "Add to Home Screen," relaunch from the home screen icon, and confirm it opens full-screen with no Safari chrome and the app functions normally.

- [ ] **Step 7: Update `README.md` and commit**

Replace the default Nuxt starter README with: what the app is, the env vars required (link to `.env.example`), how to run locally (`npm install`, set `.env`, `npm run dev`), how to deploy (Cloudflare Pages settings from Step 1), and the one-time Neon setup already done (schema via `drizzle-kit migrate`, RLS grants).

```bash
git add README.md
git commit -m "docs: replace starter README with MyOlfactoryLab setup and deploy instructions"
git push
```

```json:metadata
{"files": ["README.md", ".env.example"], "verifyCommand": "full deployed-app checklist: two-account RLS check, photo round-trip, WebClip install", "acceptanceCriteria": ["code pushed to GitHub", "Cloudflare Pages builds and serves the static output", "photos Pages Function bound to the real R2 bucket", "deployed origin added to Neon Auth trusted_origins", "two test accounts see only their own data on the live app", "app installs and runs correctly as an iOS WebClip"], "estimatedScope": "medium"}
```
