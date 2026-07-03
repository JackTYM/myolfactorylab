<script setup lang="ts">
import { usesWithin, lastUsed, daysSince, SEASONS } from '~/utils/olab';

const emit = defineEmits<{ open: [id: string] }>();

const combosStore = useCombosStore();

const WINDOWS: [string, string, number][] = [
  ['m1', 'Last month', 30],
  ['m3', '3 months', 91],
  ['m6', '6 months', 182],
];

const season = ref('All');
const win = ref('m1');

function seasonIcon(s: string) {
  return s === 'Fall/Winter' ? 'leaf' : 'sun';
}

const winEntry = computed(() => WINDOWS.find((w) => w[0] === win.value) ?? WINDOWS[0]);
const days = computed(() => winEntry.value[2]);
const winLabel = computed(() => winEntry.value[1].toLowerCase());

function onSegChange(label: string) {
  win.value = WINDOWS.find((w) => w[1] === label)?.[0] ?? WINDOWS[0][0];
}

const scoped = computed(() => combosStore.combos.filter((c) => season.value === 'All' || c.season === season.value));
const rows = computed(() => scoped.value.map((c) => ({ c, n: usesWithin(c, days.value) })));
const used = computed(() => rows.value.filter((r) => r.n > 0).sort((a, b) => b.n - a.n));
const unused = computed(() =>
  rows.value
    .filter((r) => r.n === 0)
    .sort((a, b) => (daysSince(lastUsed(b.c)) ?? 1e9) - (daysSince(lastUsed(a.c)) ?? 1e9))
);
const totalWears = computed(() => rows.value.reduce((s, r) => s + r.n, 0));
</script>

<template>
  <div style="flex: 1; display: flex; flex-direction: column; min-height: 0">
    <AppHeader kicker="What's getting used" title="Usage Report" />
    <div style="padding: 12px 18px 6px; flex-shrink: 0">
      <UiSeg :options="WINDOWS.map((w) => w[1])" :model-value="winEntry[1]" @update:model-value="onSegChange" />
    </div>
    <div class="no-scrollbar" style="display: flex; gap: 8px; overflow-x: auto; padding: 8px 18px 8px; flex-shrink: 0">
      <FilterChip v-for="s in ['All', ...SEASONS]" :key="s" :active="season === s" @click="season = s">
        <template v-if="s !== 'All'" #icon><Icon :name="seasonIcon(s)" :size="13" /></template>
        {{ s === 'All' ? 'All seasons' : s }}
      </FilterChip>
    </div>
    <div style="display: flex; gap: 10px; padding: 4px 18px 6px; flex-shrink: 0">
      <ScreensSummaryStat :value="used.length" label="Used" color="var(--stat-fresh)" />
      <ScreensSummaryStat :value="unused.length" label="Not used" color="var(--stat-neg)" />
      <ScreensSummaryStat :value="totalWears" :label="`Wears · ${winLabel}`" color="var(--brass-bright)" />
    </div>
    <div class="ol-scroll" style="flex: 1; padding: 10px 18px 18px">
      <ScreensReportGroup :title="`Used · ${winLabel}`" dot-color="var(--stat-fresh)" :rows="used" show-count :empty="`Nothing used in the ${winLabel}.`" @open="emit('open', $event)" />
      <div style="height: 20px" />
      <ScreensReportGroup :title="`Not used · ${winLabel}`" dot-color="var(--stat-neg)" :rows="unused" empty="Everything here has been used — nice." @open="emit('open', $event)" />
    </div>
  </div>
</template>
