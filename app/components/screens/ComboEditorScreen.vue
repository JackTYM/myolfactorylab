<script setup lang="ts">
import type { Combo } from '~/utils/olab';
import { comboTitle, layerArr, history, usageCounts, prettyDate, LONGEVITY_LABELS, PROJECTION_LABELS, SEASONS } from '~/utils/olab';

const props = defineProps<{ combo: Combo; isNew: boolean }>();

const emit = defineEmits<{ back: []; save: [combo: Combo]; delete: [id: string] }>();

const reference = useReferenceStore();
const layerKeys = computed(() => reference.layerKeys());

const d = ref<Combo>({
  ...props.combo,
  layers: Object.fromEntries(layerKeys.value.map((k) => [k, layerArr(props.combo, k)])),
  history: history(props.combo),
});

function set<K extends keyof Combo>(k: K, v: Combo[K]) {
  d.value[k] = v;
}

function setLayer(k: string, v: string[]) {
  d.value.layers = { ...d.value.layers, [k]: v };
}

const confirmDel = ref(false);

function logUse() {
  const today = new Date().toISOString().slice(0, 10);
  d.value.history = [today, ...history(d.value).filter((x) => x !== today)];
}

function removeUse(dt: string) {
  d.value.history = history(d.value).filter((x) => x !== dt);
}

const uc = computed(() => usageCounts(d.value));
const historyStats = computed<[string, number][]>(() => [
  ['Last month', uc.value.m1],
  ['3 months', uc.value.m3],
  ['6 months', uc.value.m6],
]);
const recentDates = computed(() => [...history(d.value)].sort((a, b) => new Date(b).getTime() - new Date(a).getTime()));
const vibeInfo = computed(() => (d.value.vibe ? reference.vibes.find((v) => v.name === d.value.vibe) ?? null : null));
const secondaryVibeInfo = computed(() => (d.value.secondaryVibe ? reference.vibes.find((v) => v.name === d.value.secondaryVibe) ?? null : null));
const title = computed(() => (props.isNew ? 'New Combo' : comboTitle(d.value, layerKeys.value)));
const ratingLabel = computed(() => ['Tap to rate', 'Redo', 'Like', 'Love'][d.value.rating]);

function vibeOptionColor(name: string) {
  return reference.vibes.find((v) => v.name === name)?.color ?? 'var(--brass)';
}
</script>

<template>
  <div style="flex: 1; display: flex; flex-direction: column; min-height: 0; animation: ol-fade .2s ease">
    <SubBar :title="title" :kicker="isNew ? 'Build a layering combo' : 'Edit combo'" @back="emit('back')">
      <template #action>
        <button
          v-if="!isNew"
          type="button"
          style="
            width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center;
            background: rgba(236,91,84,0.1); box-shadow: inset 0 0 0 1px rgba(236,91,84,0.3); color: var(--stat-neg);
          "
          @click="confirmDel = true"
        >
          <Icon name="trash" :size="17" />
        </button>
      </template>
    </SubBar>

    <div class="ol-scroll" style="flex: 1; padding: 16px 18px 18px">
      <div style="max-width: 640px; margin: 0 auto">
      <div style="margin-bottom: 16px">
        <UiDropPhoto v-model:photo-key="d.photoKey" :combo-id="d.id ?? 'draft'" />
      </div>

      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px">
        <div style="flex: 1"><UiInput v-model="d.name" placeholder="Name this combo…" /></div>
        <span
          :style="{
            display: 'flex', width: '48px', height: '48px', alignItems: 'center', justifyContent: 'center', borderRadius: '12px',
            background: d.favorite ? 'rgba(236,91,84,0.1)' : 'rgba(247,239,222,0.04)',
            boxShadow: `inset 0 0 0 1px ${d.favorite ? 'rgba(236,91,84,0.3)' : 'var(--hairline)'}`,
          }"
        >
          <UiHeartButton :active="d.favorite" :size="22" @toggle="set('favorite', !d.favorite)" />
        </span>
      </div>

      <div class="kicker" style="margin-bottom: 12px">The Layers · Applied Top → Bottom</div>
      <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px">
        <div v-for="(l, i) in reference.layers" :key="l.key" style="display: flex; gap: 11px; align-items: flex-start">
          <span
            style="
              width: 22px; height: 22px; margin-top: 10px; flex-shrink: 0; border-radius: 50%; background: var(--surface-1);
              box-shadow: inset 0 0 0 1.5px var(--brass-dim); color: var(--brass); font-family: var(--mono); font-size: 10px; font-weight: 600;
              display: flex; align-items: center; justify-content: center;
            "
          >{{ i + 1 }}</span>
          <div style="flex: 1; min-width: 0">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px">
              <span style="font-family: var(--serif); font-size: 15px; color: var(--text)">{{ l.label }}</span>
            </div>
            <UiDropdown
              multi
              allow-custom
              :model-value="d.layers[l.key] || []"
              :placeholder="`Choose ${l.label.toLowerCase()}…`"
              :options="reference.scentsForLayer(l.key)"
              @update:model-value="setLayer(l.key, $event as string[])"
              @add-custom="(v) => reference.addScent(v as string, l.key).catch((e) => console.error(e))"
            />
          </div>
        </div>
      </div>

      <div class="kicker" style="margin-bottom: 10px">Best Season</div>
      <UiSeg :options="SEASONS" v-model="d.season" />
      <div style="margin-top: 16px">
        <ScreensToggleCard icon="flame" title="High-heat safe" desc="Holds up in hot, humid weather" v-model="d.highHeat" />
      </div>

      <div class="kicker" style="margin: 24px 0 10px">Primary Vibe</div>
      <UiDropdown
        :model-value="d.vibe"
        placeholder="Choose a vibe…"
        :options="reference.vibes.map((v) => v.name).filter((n) => n !== d.secondaryVibe)"
        :option-color="vibeOptionColor"
        @update:model-value="set('vibe', $event as string)"
      />
      <div
        v-if="vibeInfo"
        :style="{
          marginTop: '12px', padding: '15px 16px', borderRadius: '14px', background: 'var(--surface-1)',
          boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${vibeInfo.color} 30%, var(--hairline))`,
          animation: 'ol-fade-up .24s ease',
        }"
      >
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 9px">
          <span :style="{ width: '9px', height: '9px', borderRadius: '50%', background: vibeInfo.color }" />
          <span class="kicker" style="color: var(--text-dim)">{{ d.vibe }}</span>
        </div>
        <h4 style="margin: 0 0 9px; font-family: var(--serif); font-weight: 600; font-size: 18px; line-height: 1.2; color: var(--text-hi)">{{ vibeInfo.name }}</h4>
        <p style="margin: 0; font-size: 13.5px; line-height: 1.55; color: var(--text)">{{ vibeInfo.logic }}</p>
        <div style="margin-top: 13px; display: flex; flex-direction: column; gap: 12px">
          <ScreensVibeInfoRow label="Atmospheric Weight" :accent="vibeInfo.color">{{ vibeInfo.weight }}</ScreensVibeInfoRow>
          <ScreensVibeInfoRow :label="`The Secret · &quot;${vibeInfo.secretWord}&quot;`" :accent="vibeInfo.color">{{ vibeInfo.secretText }}</ScreensVibeInfoRow>
          <ScreensVibeInfoRow label="Best For" :accent="vibeInfo.color">{{ vibeInfo.bestFor }}</ScreensVibeInfoRow>
        </div>
      </div>

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

      <div class="kicker" style="margin: 24px 0 12px">Longevity &amp; Projection</div>
      <div style="display: flex; gap: 12px">
        <ScreensScaleControl label="Longevity" icon="target" v-model:value="d.longevity" :labels="LONGEVITY_LABELS" />
        <ScreensScaleControl label="Projection" icon="waves" v-model:value="d.projection" :labels="PROJECTION_LABELS" />
      </div>

      <div class="kicker" style="margin: 24px 0 12px">How Much You Love It</div>
      <div style="display: flex; align-items: center; gap: 14px; padding: 14px 16px; border-radius: 14px; background: var(--surface-2); box-shadow: inset 0 0 0 1px var(--hairline)">
        <UiRatingStars :value="d.rating" :max="3" :size="30" @set-rating="set('rating', $event)" />
        <span style="font-family: var(--serif); font-size: 15px; color: var(--text-dim)">{{ ratingLabel }}</span>
      </div>

      <div class="kicker" style="margin: 24px 0 12px">Usage History</div>
      <div style="padding: 15px 16px; border-radius: 14px; background: var(--surface-2); box-shadow: inset 0 0 0 1px var(--hairline)">
        <div style="display: flex; gap: 10px; margin-bottom: 14px">
          <div
            v-for="[l, n] in historyStats"
            :key="l"
            style="flex: 1; text-align: center; padding: 10px 6px; border-radius: 11px; background: var(--surface-1); box-shadow: inset 0 0 0 1px var(--hairline-soft)"
          >
            <div :style="{ fontFamily: 'var(--serif)', fontSize: '24px', lineHeight: 1, color: n ? 'var(--brass-bright)' : 'var(--text-faint)' }">{{ n }}×</div>
            <div class="kicker" style="font-size: 8px; margin-top: 6px">{{ l }}</div>
          </div>
        </div>
        <UiPrimaryButton full tone="dark" @click="logUse"><Icon name="drop_log" :size="17" :stroke="1.7" /> Log a use today</UiPrimaryButton>
        <div v-if="recentDates.length > 0" style="margin-top: 12px">
          <div class="kicker" style="font-size: 8.5px; margin-bottom: 8px">Logged wears · tap × to remove</div>
          <div style="display: flex; flex-wrap: wrap; gap: 7px">
            <span
              v-for="dt in recentDates.slice(0, 12)"
              :key="dt"
              style="display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px; border-radius: 999px; background: rgba(247,239,222,0.04); box-shadow: inset 0 0 0 1px var(--hairline)"
            >
              <span class="mono" style="font-size: 10px; color: var(--text-dim)">{{ prettyDate(dt) }}</span>
              <span style="display: flex; color: var(--text-faint); cursor: pointer" @click="removeUse(dt)"><Icon name="close" :size="12" /></span>
            </span>
          </div>
        </div>
      </div>

      <div class="kicker" style="margin: 24px 0 12px">Notes</div>
      <UiTextArea v-model="d.note" placeholder="Your own observations — longevity, compliments, tweaks to try next time…" :rows="5" />
      <div style="height: 12px" />
      </div>
    </div>

    <div style="flex-shrink: 0; padding: 12px 16px 26px; border-top: 1px solid var(--hairline-soft); background: rgba(10,8,7,0.5)">
      <div style="max-width: 640px; margin: 0 auto">
        <UiPrimaryButton full @click="emit('save', d)"><Icon name="save" :size="18" /> {{ isNew ? 'Save combo' : 'Save changes' }}</UiPrimaryButton>
      </div>
    </div>

    <Sheet v-if="confirmDel" title="Delete this combo?" height="auto" @close="confirmDel = false">
      <p style="margin: 0 0 18px; font-size: 13.5px; color: var(--text-dim); line-height: 1.5">"{{ comboTitle(d, layerKeys) }}" will be removed permanently. This can't be undone.</p>
      <div style="display: flex; gap: 10px">
        <UiGhostButton style="flex: 1" @click="confirmDel = false">Cancel</UiGhostButton>
        <UiPrimaryButton tone="danger" style="flex: 1" @click="emit('delete', d.id!)"><Icon name="trash" :size="17" /> Delete</UiPrimaryButton>
      </div>
    </Sheet>
  </div>
</template>
