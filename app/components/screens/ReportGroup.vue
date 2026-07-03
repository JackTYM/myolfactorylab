<script setup lang="ts">
import type { Combo } from '~/utils/olab';
import { comboTitle, lastUsed, lastUsedMono } from '~/utils/olab';

defineProps<{
  title: string;
  dotColor: string;
  rows: { c: Combo; n: number }[];
  showCount?: boolean;
  empty: string;
}>();

const emit = defineEmits<{ open: [id: string] }>();

const reference = useReferenceStore();

function seasonIcon(season: string) {
  return season === 'Fall/Winter' ? 'leaf' : 'sun';
}

function vibeColor(c: Combo) {
  return c.vibe ? reference.vibes.find((v) => v.name === c.vibe)?.color ?? 'var(--brass)' : 'var(--brass)';
}
</script>

<template>
  <div>
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 11px">
      <span :style="{ width: '8px', height: '8px', borderRadius: '50%', background: dotColor }" />
      <span class="kicker">{{ title }}</span>
      <span class="mono" style="margin-left: auto; font-size: 10px; color: var(--text-faint)">{{ rows.length }}</span>
    </div>
    <div v-if="rows.length === 0" style="padding: 14px 14px; border-radius: 12px; background: var(--surface-1); box-shadow: inset 0 0 0 1px var(--hairline-soft); font-size: 12.5px; color: var(--text-faint); font-style: italic; font-family: var(--serif)">{{ empty }}</div>
    <div v-else style="display: flex; flex-direction: column; gap: 8px">
      <div
        v-for="{ c, n } in rows"
        :key="c.id"
        style="display: flex; align-items: center; gap: 12px; padding: 11px 13px; border-radius: 12px; background: var(--surface-2); box-shadow: inset 0 0 0 1px var(--hairline); cursor: pointer"
        @click="emit('open', c.id!)"
      >
        <span :style="{ width: '4px', alignSelf: 'stretch', borderRadius: '3px', background: vibeColor(c), flexShrink: 0 }" />
        <div style="flex: 1; min-width: 0">
          <div style="font-family: var(--serif); font-size: 16px; color: var(--text-hi); line-height: 1.1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ comboTitle(c, reference.layerKeys()) }}</div>
          <div style="display: flex; align-items: center; gap: 9px; margin-top: 4px">
            <CardsMetaBadge :icon="seasonIcon(c.season)">{{ c.season }}</CardsMetaBadge>
            <Icon v-if="c.favorite" name="heart" :size="12" fill style="color: var(--stat-neg)" />
          </div>
        </div>
        <span v-if="showCount" style="text-align: right">
          <span style="font-family: var(--serif); font-size: 20px; color: var(--stat-fresh)">{{ n }}×</span><br />
          <span class="mono" style="font-size: 8.5px; color: var(--text-faint)">{{ lastUsedMono(c) }}</span>
        </span>
        <span v-else class="mono" style="font-size: 9px; color: var(--text-faint); text-align: right">{{ lastUsed(c) ? lastUsedMono(c) : 'NEVER' }}</span>
      </div>
    </div>
  </div>
</template>
