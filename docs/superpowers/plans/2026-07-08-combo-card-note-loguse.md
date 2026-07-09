# Combo Card Note Indicator + Quick Log-Use Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users see/read a combo's note and log a use directly from the combo card, without opening the full-screen combo editor.

**Architecture:** A new small icon button in the bottom-right of `ComboCard.vue`'s photo area shows/hides based on `combo.note`, opening a new `Teleport`-based `NotePopover.vue` component anchored to the button. A second icon button is added to the existing top-right glass pill (next to the heart) that calls a new `logUse` Pinia store action, which reuses a new pure dedup helper in `app/utils/olab.ts`.

**Tech Stack:** Vue 3 `<script setup>`, Nuxt 4, Pinia, Vitest (for the one pure-function test file that exists in this codebase).

**User decisions (already made):**
- Log-use button placement: top-right, next to the heart button (not bottom-right, not bottom-left).
- Note display: a new lightweight popover component (not the existing `Sheet.vue` bottom-sheet).
- Note icon visibility: only rendered when `combo.note` is non-empty (no always-visible filled/outline state).

---

## Spec

Full design: `docs/superpowers/specs/2026-07-08-combo-card-note-loguse-design.md`

## Context for the implementer

- `Combo` type and DB row mapping: `app/utils/olab.ts:7-22` (interface), `app/stores/combos.ts:15-32` (`fromRow`/`toRow`).
- `combo.note` is a plain `string`, defaults to `''` — never `null`/`undefined`. Falsy check (`v-if="combo.note"`) is sufficient to detect "no note".
- `combo.history` is a plain `string[]` of `YYYY-MM-DD` date strings, one per logged use, never `null`/`undefined`.
- Existing "instant persist" pattern to follow: `app/stores/combos.ts:54-58` (`toggleFavorite`) and `:60-64` (`setRating`) — find the combo in `combos.value`, build an updated copy, `await save(...)`. No confirmation dialogs, no toasts.
- Existing icon set: `app/components/Icon.vue`. Use `name="note"` (`Icon.vue:51`) and `name="drop_log"` (`Icon.vue:42`) — both already defined, do not add new icons.
- Only pure/utility logic in this codebase is unit-tested (`app/utils/olab.test.ts` against `app/utils/olab.ts`, run with Vitest, `environment: 'node'`). No component tests exist anywhere in the repo (`@vue/test-utils` is an unused devDependency) and no store is unit-tested. Follow this convention: the new pure dedup helper gets a Vitest test; the store action and the two Vue components are verified manually via the dev server, matching how `toggleFavorite`/`setRating`/`ComboCard.vue` itself are (un)tested today.
- Type-check command: `npx nuxt typecheck` (runs `vue-tsc`; no npm script wraps it, call directly).
- Test command: `npx vitest run app/utils/olab.test.ts` (no `test` npm script exists; call vitest directly).
- Nuxt auto-imports components by folder+filename, e.g. `app/components/cards/NotePopover.vue` → usable in templates as `<CardsNotePopover>` (matches existing `<CardsMetaBadge>`, `<CardsMiniMeter>` from the same folder).

---

### Task 1: Add `withLoggedUse` pure helper to `olab.ts`

**Goal:** A pure, unit-tested function that takes a combo's existing history array and today's date string, and returns the history with today's use logged (deduped, most-recent-first).

**Files:**
- Modify: `app/utils/olab.ts` (add function after `history()`, currently at `app/utils/olab.ts:79-81`)
- Test: `app/utils/olab.test.ts`

**Acceptance Criteria:**
- [ ] `withLoggedUse([], '2026-07-08')` returns `['2026-07-08']`
- [ ] `withLoggedUse(['2026-07-01'], '2026-07-08')` returns `['2026-07-08', '2026-07-01']`
- [ ] `withLoggedUse(['2026-07-01', '2026-07-08'], '2026-07-08')` returns `['2026-07-08', '2026-07-01']` (no duplicate — existing same-day entry is replaced, not appended)

**Verify:** `npx vitest run app/utils/olab.test.ts` → all tests pass, including the 3 new ones.

**Steps:**

- [ ] **Step 1: Write the failing tests**

Add to `app/utils/olab.test.ts` (append a new `describe` block; the file already imports `describe, it, expect` from `vitest` at the top):

```ts
import { withLoggedUse } from './olab';
```

Add this import to the existing import line at the top of the file (`app/utils/olab.test.ts:1-3`) — change:

```ts
import { daysSince, comboTitle, usageCounts, lastUsedMono, lastUsed, newCombo, seasonIcon } from './olab';
```

to:

```ts
import { daysSince, comboTitle, usageCounts, lastUsedMono, lastUsed, newCombo, seasonIcon, withLoggedUse } from './olab';
```

Then append at the end of the file:

```ts
describe('withLoggedUse', () => {
  it('adds today to an empty history', () => {
    expect(withLoggedUse([], '2026-07-08')).toEqual(['2026-07-08']);
  });
  it('prepends today ahead of older entries', () => {
    expect(withLoggedUse(['2026-07-01'], '2026-07-08')).toEqual(['2026-07-08', '2026-07-01']);
  });
  it('does not duplicate an existing entry for today', () => {
    expect(withLoggedUse(['2026-07-01', '2026-07-08'], '2026-07-08')).toEqual(['2026-07-08', '2026-07-01']);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run app/utils/olab.test.ts`
Expected: FAIL — `withLoggedUse` is not exported from `./olab` (TypeScript/import error or `undefined is not a function`).

- [ ] **Step 3: Implement `withLoggedUse`**

In `app/utils/olab.ts`, add immediately after the existing `history()` function (`app/utils/olab.ts:79-81`):

```ts
export function withLoggedUse(history: string[], today: string): string[] {
  return [today, ...history.filter((d) => d !== today)];
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run app/utils/olab.test.ts`
Expected: PASS — all tests including the 3 new ones.

- [ ] **Step 5: Commit**

```bash
git add app/utils/olab.ts app/utils/olab.test.ts
git commit -m "feat: add withLoggedUse helper for logging combo uses"
```

---

### Task 2: Add `logUse` action to the combos store

**Goal:** A Pinia store action that logs a use for "today" on a given combo and persists it immediately, mirroring the existing `toggleFavorite`/`setRating` actions.

**Files:**
- Modify: `app/stores/combos.ts:1-2` (imports), `:54-67` (add action + update return statement)

**Acceptance Criteria:**
- [ ] `logUse(id)` finds the combo, computes its updated history via `withLoggedUse`, and calls `save(...)` with the rest of the combo's fields unchanged.
- [ ] `logUse(id)` is a no-op (returns without calling `save`) if no combo with that id exists in `combos.value`.
- [ ] `logUse` is exported from the store's returned object.
- [ ] `npx nuxt typecheck` passes with no new errors.

**Verify:** `npx nuxt typecheck` → no errors in `app/stores/combos.ts`.

**Steps:**

- [ ] **Step 1: Import the helper**

In `app/stores/combos.ts`, change line 2 from:

```ts
import type { Combo } from '~/utils/olab';
```

to:

```ts
import type { Combo } from '~/utils/olab';
import { withLoggedUse } from '~/utils/olab';
```

- [ ] **Step 2: Add the `logUse` action**

In `app/stores/combos.ts`, add immediately after `setRating` (currently `app/stores/combos.ts:60-64`, right before the final `return` statement):

```ts
  async function logUse(id: string) {
    const combo = combos.value.find((c) => c.id === id);
    if (!combo) return;
    const today = new Date().toISOString().slice(0, 10);
    await save({ ...combo, history: withLoggedUse(combo.history, today) });
  }
```

- [ ] **Step 3: Export it from the store**

Change the final line of `app/stores/combos.ts` (currently line 66):

```ts
  return { combos, loaded, load, save, remove, toggleFavorite, setRating };
```

to:

```ts
  return { combos, loaded, load, save, remove, toggleFavorite, setRating, logUse };
```

- [ ] **Step 4: Type-check**

Run: `npx nuxt typecheck`
Expected: no errors reported for `app/stores/combos.ts`.

- [ ] **Step 5: Commit**

```bash
git add app/stores/combos.ts
git commit -m "feat: add logUse action to combos store"
```

---

### Task 3: Create `NotePopover.vue`

**Goal:** A small, reusable, `Teleport`-based popover component that shows a note's text anchored near a trigger element's screen position, and closes on outside click.

**Files:**
- Create: `app/components/cards/NotePopover.vue`

**Acceptance Criteria:**
- [ ] Renders via `<Teleport to="body">` (required because `ComboCard.vue`'s root element uses `overflow: hidden`, which would otherwise clip the popover).
- [ ] Displays the `note` prop's text inside a rounded bubble.
- [ ] Positions the bubble using the `anchorRect` prop so the bubble's bottom-right corner sits just above the anchor's top-right corner (opens upward, doesn't require knowing the bubble's own height).
- [ ] Clicking anywhere outside the bubble emits `close`; clicking inside the bubble does not.
- [ ] `npx nuxt typecheck` passes with no new errors.

**Verify:** `npx nuxt typecheck` → no errors in `app/components/cards/NotePopover.vue`. (Visual/interaction behavior is verified manually in Task 4, once it's wired into `ComboCard.vue` and viewable in the running app — this codebase has no component-test setup, see "Context for the implementer" above.)

**Steps:**

- [ ] **Step 1: Create the component**

Create `app/components/cards/NotePopover.vue`:

```vue
<script setup lang="ts">
const props = defineProps<{ note: string; anchorRect: DOMRect }>();
defineEmits<{ close: [] }>();

const MAX_WIDTH = 220;
const GAP = 8;
const MARGIN = 8;

const bubbleStyle = computed(() => {
  const left = Math.max(MARGIN, props.anchorRect.right - MAX_WIDTH);
  const top = props.anchorRect.top - GAP;
  return {
    position: 'fixed' as const,
    left: `${left}px`,
    top: `${top}px`,
    transform: 'translateY(-100%)',
    maxWidth: `${MAX_WIDTH}px`,
  };
});
</script>

<template>
  <Teleport to="body">
    <div style="position: fixed; inset: 0; z-index: 90" @click="$emit('close')">
      <div
        :style="{
          ...bubbleStyle,
          padding: '10px 12px',
          borderRadius: '12px',
          background: 'var(--surface-1)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 0 0 1px var(--hairline)',
          color: 'var(--text)',
          fontSize: '13px',
          lineHeight: '1.4',
          whiteSpace: 'pre-wrap',
        }"
        @click.stop
      >
        {{ note }}
      </div>
    </div>
  </Teleport>
</template>
```

Note: `computed` is used without an explicit import — this matches the existing convention in this codebase (e.g. `app/components/cards/ComboCard.vue:12-19` uses `computed` the same way), since Nuxt auto-imports Vue composition APIs.

- [ ] **Step 2: Type-check**

Run: `npx nuxt typecheck`
Expected: no errors reported for `app/components/cards/NotePopover.vue`.

- [ ] **Step 3: Commit**

```bash
git add app/components/cards/NotePopover.vue
git commit -m "feat: add NotePopover component"
```

---

### Task 4: Wire note indicator and log-use button into `ComboCard.vue`

**Goal:** Users can see a note indicator on cards with a note (tap to view via `NotePopover`), and log today's use with one tap, both without leaving the combo list.

**Files:**
- Modify: `app/components/cards/ComboCard.vue:1-32` (script), `:46-60` (template, top-right pill + bottom-left badge area)

**Acceptance Criteria:**
- [ ] A combo with a non-empty `note` shows a small circular icon button (`Icon name="note"`) in the bottom-right corner of the photo area; a combo with an empty `note` does not show it.
- [ ] Tapping the note button does not navigate to the combo editor (click does not bubble to the card's `open` handler).
- [ ] Tapping the note button opens `NotePopover` anchored to the button, showing `combo.note`; tapping outside the popover closes it.
- [ ] The top-right glass pill now contains both the heart button and a new log-use icon button (`Icon name="drop_log"`).
- [ ] Tapping the log-use button does not navigate to the combo editor.
- [ ] Tapping the log-use button calls `combosStore.logUse(combo.id)`.

**Verify:** `npx nuxt typecheck` passes, then manual check in the dev server (see Step 5 below).

**Steps:**

- [ ] **Step 1: Add state and handlers to the script**

In `app/components/cards/ComboCard.vue`, change the script block. Current relevant lines (`app/components/cards/ComboCard.vue:25-31`):

```ts
function onToggleFav() {
  combosStore.toggleFavorite(props.combo.id!);
}

function onSetRating(n: number) {
  combosStore.setRating(props.combo.id!, n);
}
```

Replace with:

```ts
function onToggleFav() {
  combosStore.toggleFavorite(props.combo.id!);
}

function onSetRating(n: number) {
  combosStore.setRating(props.combo.id!, n);
}

function onLogUse() {
  combosStore.logUse(props.combo.id!);
}

const noteBtnRef = ref<HTMLButtonElement | null>(null);
const showNote = ref(false);
const noteAnchor = ref<DOMRect | null>(null);

function onShowNote() {
  noteAnchor.value = noteBtnRef.value?.getBoundingClientRect() ?? null;
  showNote.value = true;
}
```

(`ref` is used without an explicit import — matches existing convention, e.g. this same file's use of `computed` without importing it.)

- [ ] **Step 2: Add the log-use button to the top-right pill**

Current (`app/components/cards/ComboCard.vue:46-49`):

```html
      <div style="position: absolute; top: 8px; right: 8px">
        <span style="display: flex; border-radius: 999px; background: rgba(10,8,7,0.55); backdrop-filter: blur(6px)">
          <UiHeartButton :active="combo.favorite" :size="18" @toggle="onToggleFav" />
        </span>
      </div>
```

Replace with:

```html
      <div style="position: absolute; top: 8px; right: 8px">
        <span style="display: flex; align-items: center; border-radius: 999px; background: rgba(10,8,7,0.55); backdrop-filter: blur(6px)">
          <UiHeartButton :active="combo.favorite" :size="18" @toggle="onToggleFav" />
          <button
            type="button"
            aria-label="Log a use"
            style="
              display: inline-flex; align-items: center; justify-content: center;
              width: 34px; height: 34px; border-radius: 999px; background: transparent; color: var(--text);
            "
            @click.stop="onLogUse"
          >
            <Icon name="drop_log" :size="16" />
          </button>
        </span>
      </div>
```

- [ ] **Step 3: Add the note button after the bottom-left "last used" badge**

Current (`app/components/cards/ComboCard.vue:51-60`):

```html
      <div
        v-if="history(combo).length > 0"
        style="
          position: absolute; bottom: 8px; left: 10px; display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 9px; border-radius: 999px; background: rgba(10,8,7,0.6); backdrop-filter: blur(6px);
        "
      >
        <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--stat-fresh)" />
        <span class="mono" style="font-size: 8.5px; letter-spacing: 0.08em; color: var(--stat-fresh); text-transform: uppercase">{{ lastUsedMono(combo) }}</span>
      </div>
```

Replace with (adds the new button as a sibling right after this block, still inside the same photo-relative `<div>`):

```html
      <div
        v-if="history(combo).length > 0"
        style="
          position: absolute; bottom: 8px; left: 10px; display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 9px; border-radius: 999px; background: rgba(10,8,7,0.6); backdrop-filter: blur(6px);
        "
      >
        <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--stat-fresh)" />
        <span class="mono" style="font-size: 8.5px; letter-spacing: 0.08em; color: var(--stat-fresh); text-transform: uppercase">{{ lastUsedMono(combo) }}</span>
      </div>
      <button
        v-if="combo.note"
        ref="noteBtnRef"
        type="button"
        aria-label="Show note"
        style="
          position: absolute; bottom: 8px; right: 8px; display: inline-flex; align-items: center; justify-content: center;
          width: 32px; height: 32px; border-radius: 999px; background: rgba(10,8,7,0.6); backdrop-filter: blur(6px); color: var(--text);
        "
        @click.stop="onShowNote"
      >
        <Icon name="note" :size="16" />
      </button>
      <CardsNotePopover v-if="showNote && noteAnchor" :note="combo.note" :anchor-rect="noteAnchor" @close="showNote = false" />
```

- [ ] **Step 4: Type-check**

Run: `npx nuxt typecheck`
Expected: no errors reported for `app/components/cards/ComboCard.vue`.

- [ ] **Step 5: Manual verification in the dev server**

Run: `npm run dev`, open the app in a browser, go to the combos list.

1. Find (or create, via the editor, "Log a use today") a combo with a note set and at least one logged use. Confirm its card shows both the bottom-left "last used" badge and the new bottom-right note icon.
2. Find (or create) a combo with an empty note. Confirm its card does **not** show the bottom-right note icon.
3. Tap the note icon. Confirm a popover appears near the icon showing the note text, and the app does **not** navigate to the combo editor.
4. Tap outside the popover. Confirm it closes.
5. Tap the new log-use icon in the top-right pill (next to the heart). Confirm the app does **not** navigate to the combo editor, and the card's "last used" badge / "×N last mo" meta badge update to reflect a use logged today (e.g. badge text changes to "USED TODAY").
6. Tap the log-use icon again on the same combo. Open that combo in the editor and check its Usage History list — confirm there is only one entry for today's date (no duplicate).

Expected: all 6 checks pass.

- [ ] **Step 6: Commit**

```bash
git add app/components/cards/ComboCard.vue
git commit -m "feat: show note indicator and log-use button on combo cards"
```

---

## Self-Review Notes

- Spec coverage: Task 1 covers the dedup helper, Task 2 covers the store action, Task 3 covers the new popover primitive, Task 4 covers all card UI wiring (note icon visibility, popover interaction, log-use button placement) — all three spec sections are covered.
- No placeholders: every step has complete, exact code and exact file locations.
- Type consistency: `withLoggedUse(history: string[], today: string): string[]` (Task 1) is called identically in Task 2's `logUse` action; `NotePopover` (Task 3) props (`note: string`, `anchorRect: DOMRect`, emits `close`) match exactly how it's invoked in Task 4 (`:note="combo.note"`, `:anchor-rect="noteAnchor"`, `@close="showNote = false"`).
