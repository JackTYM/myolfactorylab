# Combo Feedback Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship four independent user-feedback improvements to the Combos feature: a Year-Round season option, reusable/alphabetized custom scents, uncapped scent lists on combo cards, and an optional secondary vibe.

**Architecture:** Small, additive changes layered onto the existing Nuxt 4 / Vue 3 SPA + Pinia + Neon Data API stack. Only Task 4 touches the database (one additive column + migration); the rest are pure app-layer changes.

**Tech Stack:** Nuxt 4 / Vue 3 (SPA, `ssr: false`), Pinia stores, Neon Data API (PostgREST-style), Drizzle ORM for schema/migrations only, Vitest for unit tests.

**User decisions (already made):**
- Combo cards show every scent chip, no cap — cards grow to fit.
- Custom-typed scents become real, reusable scents in the official per-layer list, alphabetized.
- Vibe gets exactly two named slots: Primary (required, existing field) + Secondary (optional); the same vibe can't fill both slots.
- Vibe filtering and search match if either Primary or Secondary equals the target.

---

## Context

Four independent improvements to the Combos feature came out of user feedback on MyOlfactoryLab. Each is small and self-contained. Full design rationale: `docs/superpowers/specs/2026-07-05-combo-feedback-design.md`.

1. **Year-Round season** — Best Season currently only offers Fall/Winter and Spring/Summer.
2. **Reusable custom scents** — typing a custom scent in a combo layer currently only saves it to that one combo; it should become a real, alphabetized, reusable option everywhere.
3. **Uncapped card scent list** — combo cards cap layer chips at 3 with a "+N" badge; feedback wants the whole list shown.
4. **Primary + Secondary vibe** — a combo can only carry one vibe today; users want an optional secondary.

---

## Task 1 — Year-Round season + centralize `seasonIcon()`

**Goal:** Add `'Year-Round'` as a third season everywhere it's offered/filtered, and remove the triplicated `seasonIcon()`.

**Files:**
- Modify: `app/utils/olab.ts` — `SEASONS` constant; add exported `seasonIcon()`.
- Modify: `app/components/Icon.vue` — add a Year-Round glyph to `STATIC_PATHS`.
- Modify: `app/components/cards/ComboCard.vue`, `app/components/screens/ReportGroup.vue`, `app/components/screens/ReportScreen.vue` — delete local `seasonIcon()`, import from `olab`.
- Modify: `app/components/screens/CombosScreen.vue` — season filter chips loop over `SEASONS`.
- Test: `app/utils/olab.test.ts` — add `seasonIcon()` cases.

**Acceptance Criteria:**
- [ ] `SEASONS = ['Fall/Winter', 'Spring/Summer', 'Year-Round']`
- [ ] `seasonIcon()` exported from `olab.ts`, used by all three former call sites
- [ ] New icon glyph added to `Icon.vue`
- [ ] `CombosScreen.vue` season chips loop over `SEASONS` (no more hardcoded two)
- [ ] `npm run test` passes

**Verify:** `npm run test` → all pass. In `npm run dev`, the editor's Best Season toggle shows 3 options; Combos and Report season filters include Year-Round and filter correctly.

**Steps:**

- [ ] **Step 1: Add `seasonIcon()` and the Year-Round icon glyph**

In `app/utils/olab.ts`, update the `SEASONS` constant and add an exported helper:

```ts
export const SEASONS = ['Fall/Winter', 'Spring/Summer', 'Year-Round'];

export function seasonIcon(season: string): string {
  if (season === 'Fall/Winter') return 'leaf';
  if (season === 'Year-Round') return 'cycle';
  return 'sun';
}
```

In `app/components/Icon.vue`, add a `cycle` entry to `STATIC_PATHS` (match the existing 24x24 stroke pattern used by `leaf`/`sun`/`regenerate`, using the file's `${S}` stroke-props helper), e.g. a closed circular double-arrow:

```html
cycle: `<g ${S}><path d="M7 7h8a4 4 0 0 1 4 4v1M17 17H9a4 4 0 0 1-4-4v-1" /><path d="M13 3l2 4-2 4M11 21l-2-4 2-4" /></g>`,
```

(Exact path values are cosmetic — any closed-loop/cycle glyph consistent with the file's existing 24x24 viewBox and stroke style is acceptable.)

- [ ] **Step 2: Add test cases**

In `app/utils/olab.test.ts`, add:

```ts
import { seasonIcon } from './olab';

describe('seasonIcon', () => {
  it('returns leaf for Fall/Winter', () => {
    expect(seasonIcon('Fall/Winter')).toBe('leaf');
  });
  it('returns cycle for Year-Round', () => {
    expect(seasonIcon('Year-Round')).toBe('cycle');
  });
  it('returns sun for Spring/Summer', () => {
    expect(seasonIcon('Spring/Summer')).toBe('sun');
  });
});
```

Run: `npm run test`
Expected: new cases PASS (implementation from Step 1 already exists).

- [ ] **Step 3: Replace the three duplicated `seasonIcon()` locals with the shared import**

In `app/components/cards/ComboCard.vue`, `app/components/screens/ReportGroup.vue`, and `app/components/screens/ReportScreen.vue`: delete each file's local `function seasonIcon(season) { ... }`, and add `seasonIcon` to that file's existing `import { ... } from '~/utils/olab'` statement.

- [ ] **Step 4: Fix `CombosScreen.vue`'s hardcoded season chips**

Replace the two hardcoded `FilterChip`s (currently literal `'Fall/Winter'` and `'Spring/Summer'`) with a loop over the shared constant, reusing the shared `seasonIcon()`:

```html
<FilterChip :active="season === 'All'" @click="season = 'All'">All seasons</FilterChip>
<FilterChip v-for="s in SEASONS" :key="s" :active="season === s" @click="season = s">
  <template #icon><Icon :name="seasonIcon(s)" :size="13" /></template>{{ s }}
</FilterChip>
```

Add `seasonIcon` to the existing `import { ... } from '~/utils/olab'` in that file.

- [ ] **Step 5: Manual verify**

Run: `npm run dev`. Open the combo editor — Best Season toggle shows 3 options. On the Combos screen and Report screen, confirm Year-Round appears as a filter chip and filters combos correctly.

- [ ] **Step 6: Commit**

```bash
git add app/utils/olab.ts app/utils/olab.test.ts app/components/Icon.vue app/components/cards/ComboCard.vue app/components/screens/ReportGroup.vue app/components/screens/ReportScreen.vue app/components/screens/CombosScreen.vue
git commit -m "feat: add Year-Round season option and centralize season icon"
```

---

## Task 2 — Custom scents become reusable & alphabetized

**Goal:** When a user types a custom scent in a combo layer, persist it to the `scents` reference table so it appears (alphabetized) as an option in every combo editor for that layer.

**Files:**
- Modify: `app/components/ui/Dropdown.vue` — add `add-custom` emit.
- Modify: `app/stores/reference.ts` — add `addScent(name, layerKey)` action.
- Modify: `app/components/screens/ComboEditorScreen.vue` — wire `@add-custom`.

**Acceptance Criteria:**
- [ ] `Dropdown.vue` emits `add-custom` with the typed value from the `multi` branch of `addCustom()`
- [ ] `reference.ts` has `addScent(name, layerKey)` that inserts-or-updates the `scents` table and keeps local state alphabetized
- [ ] `ComboEditorScreen.vue` wires `@add-custom` on every layer dropdown
- [ ] No DB migration — reuses the existing `scents` table

**Verify:** In `npm run dev`, edit combo A, type a new scent into a layer, save. Open combo B, edit the same layer — new scent appears alphabetized. Also visible in the same session without reload.

**Steps:**

- [ ] **Step 1: Add the `add-custom` emit to `Dropdown.vue`**

In `app/components/ui/Dropdown.vue`, extend the emits declaration:

```ts
const emit = defineEmits<{
  'update:modelValue': [value: string | string[]];
  'add-custom': [value: string];
}>();
```

In `addCustom()`, fire it from the `multi` branch only (the only branch `allowCustom` is used with today):

```ts
function addCustom() {
  const v = customValue.value.trim();
  if (!v) return;
  if (props.multi) {
    if (!selectedArr.value.includes(v)) emit('update:modelValue', [...selectedArr.value, v]);
    emit('add-custom', v);
  } else {
    emit('update:modelValue', v);
    open.value = false;
  }
  customValue.value = '';
}
```

- [ ] **Step 2: Add `addScent()` to the reference store**

In `app/stores/reference.ts`, add inside `useReferenceStore`:

```ts
async function addScent(name: string, layerKey: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const neon = useNeon();
  const existing = scents.value.find((s) => s.name.toLowerCase() === trimmed.toLowerCase());
  if (existing) {
    if (existing.layers.includes(layerKey)) return;
    const nextLayers = [...existing.layers, layerKey];
    const { error } = await neon.from('scents').update({ layers: nextLayers }).eq('id', existing.id);
    if (error) throw new Error('Failed to update scent: ' + error.message);
    existing.layers = nextLayers;
  } else {
    const { data, error } = await neon.from('scents').insert({ name: trimmed, layers: [layerKey] }).select().single();
    if (error) throw new Error('Failed to add scent: ' + error.message);
    scents.value.push(scentFromRow(data));
  }
  scents.value.sort((a, b) => a.name.localeCompare(b.name));
}
```

Add `addScent` to the store's returned object:

```ts
return { layers, vibes, scents, wishCategories, loaded, load, scentsForLayer, layerKeys, addScent, reset };
```

- [ ] **Step 3: Wire `@add-custom` in the combo editor**

In `app/components/screens/ComboEditorScreen.vue`, on each layer's `UiDropdown` (currently `multi allow-custom ...`), add:

```html
<UiDropdown
  multi
  allow-custom
  :model-value="d.layers[l.key] || []"
  :placeholder="`Choose ${l.label.toLowerCase()}…`"
  :options="reference.scentsForLayer(l.key)"
  @update:model-value="setLayer(l.key, $event as string[])"
  @add-custom="(v) => reference.addScent(v as string, l.key)"
/>
```

- [ ] **Step 4: Manual verify**

Run: `npm run dev`. Edit a combo, type a brand-new scent name into a layer, save. Open a different combo, edit the same layer — confirm the new scent appears alphabetized among the options (check it also appears immediately in the same session, before any reload).

- [ ] **Step 5: Commit**

```bash
git add app/components/ui/Dropdown.vue app/stores/reference.ts app/components/screens/ComboEditorScreen.vue
git commit -m "feat: persist custom combo scents as reusable reference options"
```

---

## Task 3 — Combo cards show full scent list

**Goal:** Remove the 3-chip cap on combo cards so every filled layer shows.

**Files:**
- Modify: `app/components/cards/ComboCard.vue`

**Acceptance Criteria:**
- [ ] All filled-layer chips render, no truncation
- [ ] `+N` overflow badge removed

**Verify:** In `npm run dev`, a combo with 4+ filled layers shows all its layer chips on its card, no "+N" badge; grid still lays out cleanly.

**Steps:**

- [ ] **Step 1: Remove the cap and overflow badge**

In `app/components/cards/ComboCard.vue`, change:

```html
<span v-for="k in filled.slice(0, 3)" :key="k" ...>
  ...
</span>
<span v-if="filled.length > 3" class="mono" style="align-self: center; font-size: 9px; color: var(--text-faint)">+{{ filled.length - 3 }}</span>
```

to:

```html
<span v-for="k in filled" :key="k" ...>
  ...
</span>
```

(Keep the chip's inner markup — `layerShort(k)` mono label + `layerArr(combo, k).join(' + ')` — unchanged; only the `v-for` source and the removal of the trailing overflow `<span>` change.)

- [ ] **Step 2: Manual verify**

Run: `npm run dev`. Find or create a combo with 4+ filled layers; confirm every layer's chip renders on the card with no "+N" badge, and the Combos grid still looks clean with mixed card heights.

- [ ] **Step 3: Commit**

```bash
git add app/components/cards/ComboCard.vue
git commit -m "feat: show full scent list on combo cards"
```

---

## Task 4 — Primary + Secondary vibe

**Goal:** Add an optional secondary vibe to combos, surfaced in the editor, cards, filtering, and search.

**Files:**
- Modify: `db/schema.ts` — add `secondaryVibe` column to `combos`.
- Generate: `db/migrations/0002_*.sql` via `npx drizzle-kit generate`.
- Modify: `app/utils/olab.ts` — `Combo.secondaryVibe` + `newCombo()` default.
- Modify: `app/stores/combos.ts` — map `secondary_vibe` in `fromRow`/`toRow`.
- Modify: `app/components/screens/ComboEditorScreen.vue` — Secondary Vibe dropdown + info card, relabel Primary, mutual exclusion.
- Modify: `app/components/cards/ComboCard.vue` — second vibe tag.
- Modify: `app/components/screens/CombosScreen.vue` — vibe filter/search match primary OR secondary.

**Acceptance Criteria:**
- [ ] `secondary_vibe` column added via migration; existing rows default to `''`; `db/grants.sql` NOT re-run (only adds a column to an already-granted table)
- [ ] Existing `vibe` data unchanged, now labeled "Primary Vibe" in the editor
- [ ] `Combo` type + store mapping include `secondaryVibe`
- [ ] Editor has two mutually-exclusive vibe dropdowns (can't pick the same vibe in both)
- [ ] Card shows a second vibe tag when `secondaryVibe` is set
- [ ] Filter and search match Primary OR Secondary vibe

**Verify:** Apply the migration to the dev Neon branch. In `npm run dev`: set both a primary and secondary vibe on a combo, save, reload — both persist. Card shows two tags. Filtering/searching by the secondary vibe surfaces the combo. Confirm the same vibe can't be chosen in both slots.

**Steps:**

- [ ] **Step 1: Add the schema column**

In `db/schema.ts`, add to the `combos` table definition (right after the existing `vibe` line):

```ts
vibe: text('vibe').notNull().default(''),
secondaryVibe: text('secondary_vibe').notNull().default(''),
```

- [ ] **Step 2: Generate and apply the migration**

Run: `npx drizzle-kit generate`
Expected: a new `db/migrations/0002_*.sql` file is created, adding the `secondary_vibe` column with a `''` default, plus an updated `meta/_journal.json` entry.

Run: `npx drizzle-kit migrate`
Expected: migration applies cleanly against the configured Neon connection.

Per the repo's documented workflow, `db/grants.sql` only needs re-running when a migration adds a new **table** — this migration only adds a column to the already-granted `combos` table, so skip that step.

- [ ] **Step 3: Update the `Combo` type and defaults**

In `app/utils/olab.ts`, add to the `Combo` interface (after `vibe: string;`):

```ts
vibe: string;
secondaryVibe: string;
```

And in `newCombo()` (after `vibe: '',`):

```ts
vibe: '',
secondaryVibe: '',
```

- [ ] **Step 4: Update the combos store mapping**

In `app/stores/combos.ts`, in `fromRow`:

```ts
vibe: row.vibe, secondaryVibe: row.secondary_vibe,
```

and in `toRow`:

```ts
vibe: combo.vibe, secondary_vibe: combo.secondaryVibe,
```

- [ ] **Step 5: Update the combo editor**

In `app/components/screens/ComboEditorScreen.vue`:

- Change the kicker text `Vibe Category` to `Primary Vibe`.
- Change the primary dropdown's `:options` to exclude the current secondary selection:

```html
<div class="kicker" style="margin: 24px 0 10px">Primary Vibe</div>
<UiDropdown
  :model-value="d.vibe"
  placeholder="Choose a vibe…"
  :options="reference.vibes.map((v) => v.name).filter((n) => n !== d.secondaryVibe)"
  :option-color="vibeOptionColor"
  @update:model-value="set('vibe', $event as string)"
/>
```

(keep the existing primary vibe-info card block as-is, unchanged)

- Add a new Secondary Vibe block right after the primary vibe-info card:

```html
<div class="kicker" style="margin: 24px 0 10px">Secondary Vibe (optional)</div>
<UiDropdown
  :model-value="d.secondaryVibe"
  placeholder="Choose a secondary vibe…"
  :options="reference.vibes.map((v) => v.name).filter((n) => n !== d.vibe)"
  :option-color="vibeOptionColor"
  @update:model-value="set('secondaryVibe', $event as string)"
/>
<div
  v-if="secondaryVibeInfo"
  :style="{
    marginTop: '12px', padding: '15px 16px', borderRadius: '14px', background: 'var(--surface-1)',
    boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${secondaryVibeInfo.color} 30%, var(--hairline))`,
    animation: 'ol-fade-up .24s ease',
  }"
>
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 9px">
    <span :style="{ width: '9px', height: '9px', borderRadius: '50%', background: secondaryVibeInfo.color }" />
    <span class="kicker" style="color: var(--text-dim)">{{ d.secondaryVibe }}</span>
  </div>
  <h4 style="margin: 0 0 9px; font-family: var(--serif); font-weight: 600; font-size: 18px; line-height: 1.2; color: var(--text-hi)">{{ secondaryVibeInfo.name }}</h4>
  <p style="margin: 0; font-size: 13.5px; line-height: 1.55; color: var(--text)">{{ secondaryVibeInfo.logic }}</p>
  <div style="margin-top: 13px; display: flex; flex-direction: column; gap: 12px">
    <ScreensVibeInfoRow label="Atmospheric Weight" :accent="secondaryVibeInfo.color">{{ secondaryVibeInfo.weight }}</ScreensVibeInfoRow>
    <ScreensVibeInfoRow :label="`The Secret · &quot;${secondaryVibeInfo.secretWord}&quot;`" :accent="secondaryVibeInfo.color">{{ secondaryVibeInfo.secretText }}</ScreensVibeInfoRow>
    <ScreensVibeInfoRow label="Best For" :accent="secondaryVibeInfo.color">{{ secondaryVibeInfo.bestFor }}</ScreensVibeInfoRow>
  </div>
</div>
```

Add the matching computed next to the existing `vibeInfo`:

```ts
const vibeInfo = computed(() => (d.value.vibe ? reference.vibes.find((v) => v.name === d.value.vibe) ?? null : null));
const secondaryVibeInfo = computed(() => (d.value.secondaryVibe ? reference.vibes.find((v) => v.name === d.value.secondaryVibe) ?? null : null));
```

- [ ] **Step 6: Update the combo card**

In `app/components/cards/ComboCard.vue`, add a secondary vibe color computed and a second tag next to the existing one:

```ts
const secondaryVibeInfo = computed(() => (props.combo.secondaryVibe ? reference.vibes.find((v) => v.name === props.combo.secondaryVibe) : null));
const secondaryVibeColor = computed(() => secondaryVibeInfo.value?.color || 'var(--brass)');
```

```html
<div v-if="combo.vibe || combo.secondaryVibe" style="margin-bottom: 6px; display: flex; gap: 6px; flex-wrap: wrap">
  <UiVibeTag v-if="combo.vibe" :name="combo.vibe" :color="vibeColor" />
  <UiVibeTag v-if="combo.secondaryVibe" :name="combo.secondaryVibe" :color="secondaryVibeColor" />
</div>
```

(replace the existing single `v-if="combo.vibe"` tag block with this; the left accent strip at the top of the card stays keyed to `vibeColor` — primary only, unchanged)

- [ ] **Step 7: Update filtering and search**

In `app/components/screens/CombosScreen.vue`, in the `filtered` computed:

```ts
if (vibe.value !== 'All' && c.vibe !== vibe.value && c.secondaryVibe !== vibe.value) return false;
```

And in the search `hay` line:

```ts
const hay = [comboTitle(c, layerKeys.value), c.vibe, c.secondaryVibe, c.note, ...allScents(c, layerKeys.value)].join(' ').toLowerCase();
```

- [ ] **Step 8: Manual verify**

Run: `npm run dev`. Edit a combo, set both a Primary and Secondary vibe (confirm you can't pick the same one twice), save, reload the page — both persist. Confirm the card shows two vibe tags. On the Combos screen, filter by the secondary vibe and confirm the combo appears; search by the secondary vibe's name and confirm it surfaces.

- [ ] **Step 9: Commit**

```bash
git add db/schema.ts db/migrations app/utils/olab.ts app/stores/combos.ts app/components/screens/ComboEditorScreen.vue app/components/cards/ComboCard.vue app/components/screens/CombosScreen.vue
git commit -m "feat: add optional secondary vibe to combos"
```

---

## Order & independence

Tasks 1, 2, 3 are fully independent and need no migration — any order is fine. Task 4 carries the only DB migration; doing it last keeps the schema change easy to review in isolation.

## Global verification

- `npm run test` green (Task 1 adds cases; Tasks 2-4 are UI/store changes verified manually per their Verify sections).
- `npm run dev`, walk each feature per its Verify section above.
- After Task 1, confirm no unused imports remain in the three files that had local `seasonIcon()` copies removed.
