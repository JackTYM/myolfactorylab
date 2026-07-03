<script setup lang="ts">
import { comboTitle, layerArr, allScents, usesWithin, SEASONS } from '~/utils/olab';

const emit = defineEmits<{ open: [id: string]; new: [] }>();

const reference = useReferenceStore();
const combosStore = useCombosStore();

const RATING_OPTS: [string, string][] = [
  ['any', 'Any'],
  ['3', '★★★'],
  ['2', '★★'],
  ['1', '★ least'],
];

const q = ref('');
const season = ref('All');
const fav = ref(false);
const recentOnly = ref(false);
const highHeat = ref(false);
const rating = ref('any');
const vibe = ref('All');
const layerF = ref<Record<string, string>>({});
const sheet = ref(false);

const layerKeys = computed(() => reference.layerKeys());

const layerScents = computed(() => {
  const m: Record<string, string[]> = {};
  layerKeys.value.forEach((k) => {
    const s = new Set<string>();
    combosStore.combos.forEach((c) => layerArr(c, k).forEach((v) => s.add(v)));
    m[k] = [...s].sort();
  });
  return m;
});

const filtered = computed(() => {
  const query = q.value.trim().toLowerCase();
  return combosStore.combos.filter((c) => {
    if (season.value !== 'All' && c.season !== season.value) return false;
    if (fav.value && !c.favorite) return false;
    if (recentOnly.value && usesWithin(c, 30) === 0) return false;
    if (highHeat.value && !c.highHeat) return false;
    if (vibe.value !== 'All' && c.vibe !== vibe.value) return false;
    if (rating.value !== 'any' && c.rating !== Number(rating.value)) return false;
    for (const k of layerKeys.value) {
      if (layerF.value[k] && !layerArr(c, k).includes(layerF.value[k])) return false;
    }
    if (query) {
      const hay = [comboTitle(c, layerKeys.value), c.vibe, c.note, ...allScents(c, layerKeys.value)].join(' ').toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });
});

const activeCount = computed(
  () =>
    (fav.value ? 1 : 0) +
    (recentOnly.value ? 1 : 0) +
    (highHeat.value ? 1 : 0) +
    (vibe.value !== 'All' ? 1 : 0) +
    (rating.value !== 'any' ? 1 : 0) +
    Object.values(layerF.value).filter(Boolean).length
);

function setLayerFilter(key: string, v: string) {
  layerF.value[key] = v;
}

function clearAll() {
  fav.value = false;
  recentOnly.value = false;
  highHeat.value = false;
  rating.value = 'any';
  vibe.value = 'All';
  layerF.value = {};
}
</script>

<template>
  <div style="flex: 1; display: flex; flex-direction: column; min-height: 0">
    <div style="display: flex; justify-content: center; padding: 10px 8px 0">
      <img src="/logo-v3.png" alt="MyOlfactoryLab" style="max-width: 220px; width: 100%; height: auto; display: block" />
    </div>
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 18px 4px">
      <div class="kicker">{{ combosStore.combos.length }} Combination{{ combosStore.combos.length === 1 ? '' : 's' }}</div>
      <UiIconButton icon="plus" :size="20" @click="emit('new')" />
    </div>
    <div style="flex-shrink: 0; padding: 12px 18px 4px">
      <div style="display: flex; align-items: center; gap: 10px; padding: 0 14px; border-radius: 12px; background: var(--surface-1); box-shadow: inset 0 0 0 1px var(--hairline)">
        <Icon name="search" :size="17" style="color: var(--text-faint); flex-shrink: 0" />
        <input
          v-model="q"
          placeholder="Search scent, layer, or vibe…"
          style="flex: 1; padding: 12px 0; border: none; outline: none; background: transparent; color: var(--text-hi); font-size: 14.5px; font-family: var(--sans)"
        />
        <button v-if="q" type="button" style="color: var(--text-faint); display: flex; flex-shrink: 0" @click="q = ''">
          <Icon name="close" :size="15" />
        </button>
      </div>
    </div>
    <div class="no-scrollbar" style="display: flex; gap: 8px; overflow-x: auto; padding: 12px 18px 12px; flex-shrink: 0; align-items: center">
      <button
        type="button"
        :style="{
          display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '7px 13px', borderRadius: '999px',
          fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap',
          color: activeCount ? 'var(--brass-bright)' : 'var(--text-dim)',
          background: activeCount ? 'rgba(198,161,91,0.1)' : 'rgba(247,239,222,0.03)',
          boxShadow: `inset 0 0 0 1px ${activeCount ? 'rgba(198,161,91,0.4)' : 'var(--hairline)'}`,
        }"
        @click="sheet = true"
      >
        <Icon name="filter" :size="15" />Filters{{ activeCount ? ` · ${activeCount}` : '' }}
      </button>
      <span style="width: 1px; height: 20px; background: var(--hairline); flex-shrink: 0" />
      <FilterChip :active="season === 'All'" @click="season = 'All'">All seasons</FilterChip>
      <FilterChip :active="season === 'Fall/Winter'" @click="season = 'Fall/Winter'">
        <template #icon><Icon name="leaf" :size="13" /></template>Fall/Winter
      </FilterChip>
      <FilterChip :active="season === 'Spring/Summer'" @click="season = 'Spring/Summer'">
        <template #icon><Icon name="sun" :size="13" /></template>Spring/Summer
      </FilterChip>
    </div>
    <div class="ol-scroll" style="flex: 1; padding: 2px 18px 18px">
      <ScreensEmptyCombos v-if="combosStore.combos.length === 0" @new="emit('new')" />
      <div v-else-if="filtered.length === 0" style="text-align: center; padding: 60px 20px; color: var(--text-faint)">
        <Icon name="search" :size="30" style="margin: 0 auto 12px; color: var(--text-faint)" />
        <div style="font-family: var(--serif); font-size: 18px; color: var(--text-dim)">No matching combos</div>
        <div style="font-size: 12.5px; margin-top: 6px">Try loosening the search or filters.</div>
        <button v-if="activeCount > 0" type="button" style="margin-top: 16px; color: var(--brass-bright); font-size: 13px; font-weight: 600" @click="clearAll">Clear filters</button>
      </div>
      <div v-else style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px">
        <CardsComboCard v-for="c in filtered" :key="c.id" :combo="c" @open="emit('open', $event)" />
      </div>
    </div>

    <Sheet v-if="sheet" title="Search &amp; filter" @close="sheet = false">
      <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 6px">
        <ScreensFilterToggle icon="heart" label="Favorites only" v-model="fav" />
        <ScreensFilterToggle icon="calendar" label="Recently used only" v-model="recentOnly" />
        <ScreensFilterToggle icon="flame" label="High-heat safe only" v-model="highHeat" />
      </div>

      <div class="kicker" style="margin-bottom: 9px">Rating</div>
      <div style="display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 16px">
        <FilterChip v-for="[v, l] in RATING_OPTS" :key="v" :active="rating === v" @click="rating = v">{{ l }}</FilterChip>
      </div>

      <div class="kicker" style="margin-bottom: 9px">Season</div>
      <div style="display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 16px">
        <FilterChip v-for="s in ['All', ...SEASONS]" :key="s" :active="season === s" @click="season = s">{{ s }}</FilterChip>
      </div>

      <div class="kicker" style="margin-bottom: 9px">Vibe category</div>
      <div style="display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 18px">
        <FilterChip :active="vibe === 'All'" @click="vibe = 'All'">All</FilterChip>
        <FilterChip v-for="v in reference.vibes" :key="v.name" :color="v.color" :active="vibe === v.name" @click="vibe = v.name">{{ v.name }}</FilterChip>
      </div>

      <div class="kicker" style="margin-bottom: 9px">By layer scent</div>
      <p style="margin: 0 0 12px; font-size: 12px; color: var(--text-dim); line-height: 1.5">Pull every combo that uses a specific scent in a layer — e.g. Raspberry Sorbet body wash.</p>
      <div style="display: flex; flex-direction: column; gap: 10px">
        <div v-for="l in reference.layers.filter((l) => layerScents[l.key]?.length)" :key="l.key">
          <div class="kicker" style="margin-bottom: 7px">{{ l.label }}</div>
          <UiDropdown
            :model-value="layerF[l.key] || ''"
            :placeholder="`Any ${l.label.toLowerCase()}`"
            :options="layerScents[l.key]"
            @update:model-value="setLayerFilter(l.key, $event as string)"
          />
        </div>
      </div>

      <div style="display: flex; gap: 10px; margin-top: 20px">
        <UiGhostButton style="flex: 1" @click="clearAll"><Icon name="regenerate" :size="16" /> Clear all</UiGhostButton>
        <UiPrimaryButton style="flex: 1" @click="sheet = false"><Icon name="check" :size="17" :stroke="2" /> Show {{ filtered.length }}</UiPrimaryButton>
      </div>
    </Sheet>
  </div>
</template>
