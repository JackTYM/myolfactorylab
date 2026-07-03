<script setup lang="ts">
const props = withDefaults(defineProps<{ file: File; aspect?: number }>(), { aspect: 4 / 3 });

const emit = defineEmits<{ confirm: [Blob]; cancel: [] }>();

const imgUrl = URL.createObjectURL(props.file);
const imgEl = ref<HTMLImageElement | null>(null);
const frameEl = ref<HTMLDivElement | null>(null);

const ready = ref(false);
const naturalW = ref(0);
const naturalH = ref(0);
const frameW = ref(0);
const frameH = ref(0);
const minScale = ref(1);
const maxScale = ref(1);
const scale = ref(1);
const offsetX = ref(0);
const offsetY = ref(0);

const dragging = ref(false);
let dragStartX = 0;
let dragStartY = 0;
let dragOriginX = 0;
let dragOriginY = 0;

function clampOffsets() {
  const dispW = naturalW.value * scale.value;
  const dispH = naturalH.value * scale.value;
  offsetX.value = Math.min(0, Math.max(frameW.value - dispW, offsetX.value));
  offsetY.value = Math.min(0, Math.max(frameH.value - dispH, offsetY.value));
}

function onImageLoad() {
  const el = imgEl.value;
  const frame = frameEl.value;
  if (!el || !frame) return;
  naturalW.value = el.naturalWidth;
  naturalH.value = el.naturalHeight;
  frameW.value = frame.clientWidth;
  frameH.value = frame.clientHeight;

  minScale.value = Math.max(frameW.value / naturalW.value, frameH.value / naturalH.value);
  maxScale.value = minScale.value * 3;
  scale.value = minScale.value;
  offsetX.value = (frameW.value - naturalW.value * scale.value) / 2;
  offsetY.value = (frameH.value - naturalH.value * scale.value) / 2;
  ready.value = true;
}

function onZoomInput(e: Event) {
  const next = Number((e.target as HTMLInputElement).value);
  const centerX = frameW.value / 2;
  const centerY = frameH.value / 2;
  const imgX = (centerX - offsetX.value) / scale.value;
  const imgY = (centerY - offsetY.value) / scale.value;
  scale.value = next;
  offsetX.value = centerX - imgX * next;
  offsetY.value = centerY - imgY * next;
  clampOffsets();
}

function onPointerDown(e: PointerEvent) {
  dragging.value = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  dragOriginX = offsetX.value;
  dragOriginY = offsetY.value;
  (e.target as HTMLElement).setPointerCapture(e.pointerId);
}

function onPointerMove(e: PointerEvent) {
  if (!dragging.value) return;
  offsetX.value = dragOriginX + (e.clientX - dragStartX);
  offsetY.value = dragOriginY + (e.clientY - dragStartY);
  clampOffsets();
}

function onPointerUp() {
  dragging.value = false;
}

async function confirm() {
  const outputW = 1200;
  const outputH = Math.round(outputW / props.aspect);
  const canvas = document.createElement('canvas');
  canvas.width = outputW;
  canvas.height = outputH;
  const ctx = canvas.getContext('2d');
  if (!ctx || !imgEl.value) return;

  const sourceX = -offsetX.value / scale.value;
  const sourceY = -offsetY.value / scale.value;
  const sourceW = frameW.value / scale.value;
  const sourceH = frameH.value / scale.value;

  ctx.drawImage(imgEl.value, sourceX, sourceY, sourceW, sourceH, 0, 0, outputW, outputH);
  canvas.toBlob(
    (blob) => {
      if (blob) emit('confirm', blob);
    },
    'image/jpeg',
    0.9
  );
}

onBeforeUnmount(() => URL.revokeObjectURL(imgUrl));
</script>

<template>
  <div
    style="
      position: fixed;
      inset: 0;
      z-index: 200;
      background: var(--surface-1);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      gap: 20px;
    "
  >
    <h3 style="margin: 0; font-family: var(--serif); font-size: 18px; color: var(--text-hi); font-weight: 600; align-self: center">
      Adjust photo
    </h3>

    <div
      ref="frameEl"
      :style="{
        position: 'relative',
        width: '100%',
        maxWidth: '420px',
        aspectRatio: String(aspect),
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'var(--surface-2)',
        boxShadow: '0 0 0 1px var(--hairline), 0 0 0 2000px rgba(6,5,4,0.55)',
        touchAction: 'none',
        cursor: dragging ? 'grabbing' : 'grab',
      }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <img
        ref="imgEl"
        :src="imgUrl"
        alt="Photo being cropped"
        draggable="false"
        :style="{
          position: 'absolute',
          left: '0',
          top: '0',
          width: naturalW ? `${naturalW}px` : 'auto',
          height: naturalH ? `${naturalH}px` : 'auto',
          transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
          transformOrigin: '0 0',
          userSelect: 'none',
          visibility: ready ? 'visible' : 'hidden',
        }"
        @load="onImageLoad"
      />
    </div>

    <input
      v-if="ready"
      type="range"
      :min="minScale"
      :max="maxScale"
      :step="(maxScale - minScale) / 100"
      :value="scale"
      style="width: 100%; max-width: 420px"
      @input="onZoomInput"
    />

    <div style="display: flex; gap: 10px; width: 100%; max-width: 420px">
      <UiGhostButton style="flex: 1" @click="emit('cancel')">Cancel</UiGhostButton>
      <UiPrimaryButton style="flex: 1" :disabled="!ready" @click="confirm">
        <Icon name="check" :size="17" :stroke="2" /> Use photo
      </UiPrimaryButton>
    </div>
  </div>
</template>
