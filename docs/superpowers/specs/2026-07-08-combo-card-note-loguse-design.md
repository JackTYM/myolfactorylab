# Combo Card: Note Indicator + Quick Log-Use

## Problem

`ComboCard.vue` (`app/components/cards/ComboCard.vue`) has no way to see whether a combo
has a note, or to log a use, without opening the full-screen combo editor. Both are
common, low-friction actions users want to do straight from the combo list.

## Goals

1. Show a small indicator on the card when `combo.note` is non-empty; tapping it reveals
   the note text without navigating away from the list.
2. Add a button on the card that logs a use for "today" immediately, without opening the
   editor.

## Non-goals

- Editing or clearing the note from the card (still editor-only).
- Removing/undoing a logged use from the card (still editor-only).
- Any new toast/confirmation UI — existing card actions (favorite, rating) apply
  instantly with only their own visual state as feedback, and this follows the same
  convention.

## Design

### 1. Note indicator

- Placed in the bottom-right corner of the photo area in `ComboCard.vue`, at
  `position: absolute; bottom: 8px; right: 8px`. Styled as a small circular glass pill
  (~32px, `background: rgba(10,8,7,0.6)`, `backdrop-filter: blur(6px)`), matching the
  visual language of the existing "last used" badge (bottom-left) and heart badge
  (top-right).
- Contains `<Icon name="note" :size="16" />` (icon already exists in `Icon.vue`).
- Rendered only when `combo.note` is truthy — mirrors the existing
  `v-if="history(combo).length > 0"` pattern used for the "last used" badge.
- Click handler uses `@click.stop` (so it doesn't trigger the card's `open` navigation)
  and opens the `NotePopover` described below, passing the button's
  `getBoundingClientRect()` as the anchor.

### 2. `NotePopover` component

New file: `app/components/cards/NotePopover.vue`.

- No popover primitive currently exists in the codebase (only the full `Sheet.vue`
  bottom-sheet). Rather than reuse `Sheet` (too heavy for a one-line note) or hand-anchor
  inside the card, this introduces a small, single-purpose popover.
- Must be `<Teleport to="body">`: `ComboCard.vue`'s outer element has
  `overflow: hidden` (for its rounded corners), which would clip an in-place absolutely
  positioned popover that needs to render outside the card's bounds.
- Structure:
  - Full-screen invisible backdrop (`position: fixed; inset: 0`) that emits `close` on
    click, so tapping anywhere outside dismisses it.
  - A bubble (`position: fixed`, `background: var(--surface-1)`, inset hairline border,
    `border-radius: 12px`, `max-width: 220px`, ~13px text, `line-height: 1.4`) showing the
    raw note text.
- Positioning: given the icon's `DOMRect` (`anchorRect` prop), the bubble is placed with
  `left = anchorRect.right - bubbleWidth` (clamped to a minimum screen margin) and
  `top = anchorRect.top`, then shifted fully above the anchor via
  `transform: translateY(-100%)` plus a small gap. This anchors the bubble's bottom-right
  to the icon's top-right and opens upward, so it doesn't need to know its own rendered
  height in advance and stays clear of the card edge below it.
- Props: `note: string`, `anchorRect: DOMRect`. Emits: `close: []`.
- `ComboCard.vue` holds local state (`showNote: boolean`, `noteAnchor: DOMRect | null`)
  and a template ref on the note button to compute `noteAnchor` on open.

### 3. Log-a-use button

- Added inside the existing top-right glass pill in `ComboCard.vue`, alongside
  `UiHeartButton`, as a second small icon button:
  `<Icon name="drop_log" :size="16" />` (same icon already used by the editor's
  "Log a use today" button).
- Click handler: `@click.stop="onLogUse"` → calls `combosStore.logUse(combo.id!)`.
- New store action in `app/stores/combos.ts`:

  ```ts
  async function logUse(id: string) {
    const combo = combos.value.find((c) => c.id === id);
    if (!combo) return;
    const today = new Date().toISOString().slice(0, 10);
    const newHistory = [today, ...combo.history.filter((x) => x !== today)];
    await save({ ...combo, history: newHistory });
  }
  ```

  This mirrors the existing `toggleFavorite`/`setRating` actions (find combo, produce
  updated copy, `await save(...)`) and the dedup logic already used by
  `ComboEditorScreen.vue`'s local `logUse()` (removes any existing entry for today before
  prepending, so repeated taps on the same day are idempotent — no duplicate history
  entries).
  - Export `logUse` from the store's returned object alongside the existing actions.
- No disabled/"already logged today" state is added — repeated taps are harmless no-ops
  on the data, and the card's own "last used" badge / "×N last mo" meta badge update
  immediately as passive confirmation (consistent with how favorite/rating give no
  separate confirmation either).

## Files touched

- `app/components/cards/ComboCard.vue` — add note indicator button + popover wiring, add
  log-use button in top-right pill.
- `app/components/cards/NotePopover.vue` — new file.
- `app/stores/combos.ts` — add `logUse` action.

## Testing / verification

- Manual: open the combos list, confirm a combo with a note shows the note icon and one
  without does not; tap it, confirm the popover shows the correct text and dismisses on
  outside tap; confirm tapping it does not navigate to the editor.
- Manual: tap the log-use button on a card, confirm the "last used" badge and "×N last
  mo" badge update without navigating to the editor; confirm repeated taps the same day
  don't create duplicate history entries (check via the editor's usage history list).
