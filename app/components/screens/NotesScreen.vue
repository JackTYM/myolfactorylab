<script setup lang="ts">
import { prettyDate } from '~/utils/olab';

const notesStore = useNotesStore();

function onAdd() {
  notesStore.create();
}

function onUpdate(id: string, patch: { title?: string; body?: string }) {
  notesStore.update(id, patch);
}

function onDelete(id: string) {
  notesStore.remove(id);
}
</script>

<template>
  <div style="flex: 1; display: flex; flex-direction: column; min-height: 0">
    <AppHeader :kicker="`${notesStore.notes.length} note${notesStore.notes.length === 1 ? '' : 's'}`" title="Notes">
      <template #right>
        <UiIconButton icon="plus" :size="20" @click="onAdd" />
      </template>
    </AppHeader>
    <div class="ol-scroll" style="flex: 1; padding: 14px 18px 18px">
      <p style="margin: 0 0 16px; font-size: 13px; color: var(--text-dim); line-height: 1.55">A scratchpad for anything — paste notes from AI, keep reminders, or track ideas.</p>
      <div v-if="notesStore.notes.length === 0" style="text-align: center; padding: 60px 24px; color: var(--text-faint)">
        <Icon name="note" :size="32" style="margin: 0 auto 14px; color: var(--text-faint)" />
        <div style="font-family: var(--serif); font-size: 18px; color: var(--text-dim)">No notes yet</div>
        <div style="font-size: 12.5px; margin-top: 6px">Tap + to start one.</div>
      </div>
      <div v-else style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px">
        <div
          v-for="n in notesStore.notes"
          :key="n.id"
          style="background: var(--surface-2); border-radius: 15px; box-shadow: inset 0 0 0 1px var(--hairline); padding: 12px 14px"
        >
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px">
            <input
              :value="n.title"
              placeholder="Title"
              style="flex: 1; border: none; outline: none; background: transparent; color: var(--text-hi); font-family: var(--serif); font-size: 18px; font-weight: 600"
              @input="onUpdate(n.id!, { title: ($event.target as HTMLInputElement).value })"
            />
            <button type="button" style="color: var(--text-faint); padding: 4px; display: flex" @click="onDelete(n.id!)">
              <Icon name="trash" :size="16" />
            </button>
          </div>
          <UiTextArea
            :model-value="n.body"
            placeholder="Type or paste anything…"
            :rows="4"
            @update:model-value="onUpdate(n.id!, { body: $event })"
          />
          <div v-if="n.updatedOn" class="mono" style="font-size: 8.5px; color: var(--text-faint); letter-spacing: 0.1em; margin-top: 8px; text-align: right">UPDATED {{ prettyDate(n.updatedOn.slice(0, 10)).toUpperCase() }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
