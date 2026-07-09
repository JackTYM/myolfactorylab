<script setup lang="ts">
import type { Combo } from '~/utils/olab';
import { comboTitle, filledLayers, layerArr, history, usageCounts, lastUsedMono, seasonIcon, comboSeasons } from '~/utils/olab';

const props = defineProps<{ combo: Combo }>();

const emit = defineEmits<{ open: [id: string] }>();

const reference = useReferenceStore();
const combosStore = useCombosStore();

const layerKeys = computed(() => reference.layerKeys());
const filled = computed(() => filledLayers(props.combo, layerKeys.value));
const title = computed(() => comboTitle(props.combo, layerKeys.value));
const uses = computed(() => usageCounts(props.combo));
const vibeInfo = computed(() => (props.combo.vibe ? reference.vibes.find((v) => v.name === props.combo.vibe) : null));
const vibeColor = computed(() => vibeInfo.value?.color || 'var(--brass)');
const secondaryVibeInfo = computed(() => (props.combo.secondaryVibe ? reference.vibes.find((v) => v.name === props.combo.secondaryVibe) : null));
const secondaryVibeColor = computed(() => secondaryVibeInfo.value?.color || 'var(--brass)');

function layerShort(k: string) {
  return reference.layers.find((l) => l.key === k)?.shortLabel ?? k;
}

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
</script>

<template>
  <div
    style="
      position: relative; background: var(--surface-2); border-radius: 18px;
      box-shadow: inset 0 0 0 1px var(--hairline); overflow: hidden; cursor: pointer;
      display: flex; flex-direction: column;
    "
    @click="emit('open', combo.id!)"
  >
    <div style="position: relative">
      <UiDropPhoto :photo-key="combo.photoKey" :combo-id="combo.id!" readonly />
      <span v-if="combo.vibe" :style="{ position: 'absolute', left: '0', top: '0', bottom: '0', width: '4px', background: vibeColor }" />
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
    </div>
    <div style="padding: 12px 14px 14px">
      <div v-if="combo.vibe || combo.secondaryVibe" style="margin-bottom: 6px; display: flex; gap: 6px; flex-wrap: wrap">
        <UiVibeTag v-if="combo.vibe" :name="combo.vibe" :color="vibeColor" />
        <UiVibeTag v-if="combo.secondaryVibe" :name="combo.secondaryVibe" :color="secondaryVibeColor" />
      </div>
      <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 10px">
        <h3 style="margin: 0; font-family: var(--serif); font-weight: 600; font-size: 20px; line-height: 1.06; color: var(--text-hi); text-wrap: pretty">{{ title }}</h3>
        <div style="flex-shrink: 0; padding-top: 2px" @click.stop>
          <UiRatingStars :value="combo.rating" :max="3" :size="15" @set-rating="onSetRating" />
        </div>
      </div>
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-top: 10px">
        <CardsMetaBadge v-for="s in comboSeasons(combo)" :key="s" :icon="seasonIcon(s)" color="var(--text-dim)">{{ s }}</CardsMetaBadge>
        <CardsMetaBadge v-if="combo.highHeat" icon="flame" color="var(--stat-mod)">Heat Safe</CardsMetaBadge>
        <CardsMetaBadge v-if="uses.m1 > 0" icon="calendar" color="var(--stat-fresh)">{{ uses.m1 }}× last mo</CardsMetaBadge>
        <CardsMetaBadge>{{ filled.length }} / {{ layerKeys.length }} layers</CardsMetaBadge>
      </div>
      <div v-if="combo.longevity || combo.projection" style="display: flex; gap: 16px; margin-top: 10px">
        <CardsMiniMeter label="Longevity" :value="combo.longevity || 0" />
        <CardsMiniMeter label="Projection" :value="combo.projection || 0" />
      </div>
      <div v-if="filled.length > 0" style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 11px">
        <span
          v-for="k in filled"
          :key="k"
          style="
            display: inline-flex; align-items: center; gap: 5px; padding: 4px 9px; border-radius: 8px;
            background: rgba(247,239,222,0.03); box-shadow: inset 0 0 0 1px var(--hairline);
          "
        >
          <span class="mono" style="font-size: 8px; color: var(--text-faint); text-transform: uppercase; letter-spacing: 0.05em">{{ layerShort(k) }}</span>
          <span style="font-family: var(--serif); font-size: 12.5px; color: var(--text)">{{ layerArr(combo, k).join(' + ') }}</span>
        </span>
      </div>
    </div>
  </div>
</template>
