<script setup lang="ts">
import type { Tab } from '~/utils/olab';

defineProps<{ active: Tab }>();
const emit = defineEmits<{ change: [tab: Tab]; new: [] }>();

const TABS = [
  { key: 'combos', icon: 'rack', label: 'Combos' },
  { key: 'wish', icon: 'bookmark', label: 'Wish List' },
  { key: 'new', icon: 'plus', label: 'New', center: true },
  { key: 'report', icon: 'chart', label: 'Report' },
  { key: 'notes', icon: 'note', label: 'Notes' },
];
</script>

<template>
  <div
    style="
      flex-shrink: 0; position: relative; display: flex; align-items: flex-start; justify-content: space-around;
      padding: 10px 6px 26px; background: linear-gradient(180deg, rgba(18,14,10,0.4), var(--ink-950));
      border-top: 1px solid var(--hairline); backdrop-filter: blur(10px);
    "
  >
    <template v-for="t in TABS" :key="t.key">
      <button
        v-if="t.center"
        type="button"
        style="display: flex; flex-direction: column; align-items: center; gap: 5px; margin-top: -22px; flex: 1"
        @click="emit('new')"
      >
        <span
          style="
            width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
            background: radial-gradient(circle at 32% 28%, var(--brass-bright), var(--brass) 70%); color: #1a1305;
            box-shadow: 0 8px 22px rgba(198,161,91,0.4), inset 0 1px 0 rgba(255,255,255,0.5), 0 0 0 1px rgba(198,161,91,0.5);
          "
        >
          <Icon name="plus" :size="28" :stroke="2" />
        </span>
        <span class="mono" style="font-size: 8.5px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-faint)">{{ t.label }}</span>
      </button>
      <button
        v-else
        type="button"
        :style="{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1, paddingTop: '4px',
          color: active === t.key ? 'var(--brass-bright)' : 'var(--text-faint)', transition: 'color .18s',
        }"
        @click="emit('change', t.key as Tab)"
      >
        <Icon :name="t.icon" :size="23" :stroke="active === t.key ? 1.9 : 1.6" />
        <span class="mono" style="font-size: 8.5px; letter-spacing: 0.08em; text-transform: uppercase">{{ t.label }}</span>
      </button>
    </template>
  </div>
</template>
