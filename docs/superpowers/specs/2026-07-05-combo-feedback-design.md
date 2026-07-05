# Combo Feedback Features — Design

Four small, independent improvements to the Combos feature, based on user feedback:

1. Add a "Year-Round" Best Season option
2. Custom scent options become real, reusable, alphabetized options
3. Combo cards show the full scent list (no "+N" truncation)
4. Primary + Secondary Vibe (two vibe slots instead of one)

## 1. Year-Round season option

**Current state:** `SEASONS = ['Fall/Winter', 'Spring/Summer']` in `app/utils/olab.ts:25`, a plain text column (`combos.season`, no enum constraint) with `seasonIcon()` duplicated in three components.

**Change:**
- `SEASONS = ['Fall/Winter', 'Spring/Summer', 'Year-Round']` in `app/utils/olab.ts`.
- Add a `seasonIcon(season: string): string` helper to `app/utils/olab.ts`, exported and used by all three call sites (`ComboCard.vue`, `ReportGroup.vue`, `ReportScreen.vue`), replacing the three duplicated local functions.
- Add a new icon glyph to `app/components/Icon.vue`'s `STATIC_PATHS` map for the Year-Round case (no existing icon fits; `sun`/`leaf` are used for the other two). A simple closed-loop/cycle glyph, following the existing 24x24 stroke-path pattern.
- `ComboEditorScreen.vue`'s `<UiSeg :options="SEASONS" />` already iterates the constant — no change needed there.
- `CombosScreen.vue:120-125` currently hardcodes two `FilterChip`s for the two season literals instead of mapping over `SEASONS`. Replace with a `v-for="s in SEASONS"` loop using the new shared `seasonIcon()`, so all three (now current + future) options appear.
- `ReportScreen.vue` and its filter-sheet-equivalent already map over `['All', ...SEASONS]` — these pick up Year-Round automatically once `SEASONS` is updated.
- No DB migration — `season` is unconstrained text.

## 2. Custom scent options become real, reusable, alphabetized

**Current state:** In `ComboEditorScreen.vue`, each layer's `UiDropdown` has `multi allow-custom`. `Dropdown.vue`'s `addCustom()` (`app/components/ui/Dropdown.vue:58-68`) only emits the typed string into that combo's local `layers` array via `update:modelValue` — it's never written to the `scents` reference table, so it doesn't appear as an option in any other combo's editor, and doesn't benefit from the existing alphabetical load order (`reference.ts:68`, `.order('name', { ascending: true })`).

**Change:**
- `Dropdown.vue`: add a new emit, `add-custom: [value: string]`, fired from `addCustom()` alongside the existing `update:modelValue` (only in the `multi` branch — that's the only place `allowCustom` is actually used today).
- `app/stores/reference.ts`: add an `addScent(name: string, layerKey: string)` action:
  - Trim `name`; if empty, no-op.
  - Look for an existing entry in `scents.value` with a case-insensitive exact match on `name`.
    - If found and its `layers` doesn't already include `layerKey`: `update` that row's `layers` (append `layerKey`) via `neon.from('scents').update(...).eq('id', ...)`, then update the local `scents.value` entry in place.
    - If not found: `insert` a new row `{ name, layers: [layerKey] }` via `neon.from('scents').insert(...).select().single()`, then push the returned row (mapped through `scentFromRow`) into `scents.value`.
  - After either branch, re-sort `scents.value` by `name` (matches the initial load order, keeps `scentsForLayer()` alphabetized without needing a refetch).
- `ComboEditorScreen.vue`: each layer's `UiDropdown` gets `@add-custom="(v) => reference.addScent(v, l.key)"`.
- No DB migration — `scents` table and its `(userId, name)` unique index already exist and are reused as-is (a given scent name can belong to multiple layers, which the schema already supports via the `layers` jsonb array column).

## 3. Combo cards show the full scent list

**Current state:** `ComboCard.vue:82-95` renders `filled.slice(0, 3)` layer chips, then a `+{{ filled.length - 3 }}` badge for the rest.

**Change:**
- Remove the `.slice(0, 3)` cap and the trailing `+N` badge — `v-for="k in filled"` renders every filled layer's chip.
- No other layout change; the parent grid (`CombosScreen.vue:135-137`, `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`) already tolerates variable card heights.

## 4. Primary + Secondary Vibe

**Current state:** `combos.vibe` is a single free-form `text` column (`db/schema.ts:17`), matched by exact name string against the `vibes` reference table (no FK). Single-select `UiDropdown` in `ComboEditorScreen.vue:123-129`. Filtering/search treat `vibe` as a single value (`CombosScreen.vue:45, 51`, `ComboCard.vue:20-21`, `ReportGroup.vue:21-22`).

**Change:**
- **Schema:** add `secondaryVibe: text('secondary_vibe').notNull().default('')` to the `combos` table in `db/schema.ts`. Generate a Drizzle migration (`npx drizzle-kit generate`) — this only adds a column to an already-granted table, so `db/grants.sql` does not need to be re-run (that step is only required when migrations add new tables).
- **Existing data:** untouched — the current `vibe` column keeps its meaning and becomes "Primary Vibe" in the UI; `secondaryVibe` defaults to `''` (unset) for all existing rows.
- **Type:** add `secondaryVibe: string;` to the `Combo` interface in `app/utils/olab.ts`, and `secondaryVibe: ''` to `newCombo()`.
- **Store:** `app/stores/combos.ts` `fromRow`/`toRow` map `secondary_vibe` ↔ `secondaryVibe`, same pattern as the existing `vibe` field.
- **Editor UI (`ComboEditorScreen.vue`):**
  - Relabel the existing "Vibe Category" kicker to "Primary Vibe".
  - Add a second block below it: kicker "Secondary Vibe (optional)", a `UiDropdown` bound to `d.secondaryVibe`, options = `reference.vibes` excluding whichever vibe is currently selected as Primary. Same treatment in reverse for the Primary dropdown (excludes the currently selected Secondary), so the same vibe can't occupy both slots.
  - Its own vibe-info card (reusing the existing `ScreensVibeInfoRow` block pattern) shown when a secondary vibe is selected.
- **Card display (`ComboCard.vue`):** show a second `UiVibeTag` next to the existing one when `combo.secondaryVibe` is set. The left accent color strip stays keyed to the Primary vibe's color only.
- **Filtering (`CombosScreen.vue`):** the vibe filter chip matches if `c.vibe === vibe.value || c.secondaryVibe === vibe.value`. Search (`hay` string, line 51) includes `c.secondaryVibe` alongside `c.vibe`.
- **Report screen / `ReportGroup.vue`:** no change — these only key off the primary vibe's color for the accent bar, which is unaffected.

## Summary of touched files

| File | Change |
|---|---|
| `app/utils/olab.ts` | `SEASONS` +Year-Round; shared `seasonIcon()`; `Combo.secondaryVibe` field; `newCombo()` default |
| `app/components/Icon.vue` | new icon glyph for Year-Round |
| `app/components/ui/Dropdown.vue` | new `add-custom` emit |
| `app/stores/reference.ts` | new `addScent()` action |
| `app/stores/combos.ts` | map `secondary_vibe` in `fromRow`/`toRow` |
| `app/components/screens/ComboEditorScreen.vue` | wire `add-custom`; Secondary Vibe field + info card; relabel Primary |
| `app/components/cards/ComboCard.vue` | use shared `seasonIcon()`; remove chip cap; show secondary vibe tag |
| `app/components/screens/ReportGroup.vue` | use shared `seasonIcon()` |
| `app/components/screens/ReportScreen.vue` | use shared `seasonIcon()` |
| `app/components/screens/CombosScreen.vue` | season chips loop over `SEASONS`; vibe filter/search matches primary or secondary |
| `db/schema.ts` | new `secondaryVibe` column on `combos` |
| `db/migrations/000X_*.sql` (generated) | adds `secondary_vibe` column |

## Testing

- `app/utils/olab.test.ts` already covers `comboTitle`; add cases for `seasonIcon()` (all three seasons) once centralized.
- Manual verification (per this repo's `verify`/`run` conventions): add a combo with a custom scent, confirm it reappears alphabetized when editing a different combo's same layer; set Year-Round on a combo and confirm it filters correctly; set both a primary and secondary vibe and confirm card tags, filtering, and search all reflect it.
