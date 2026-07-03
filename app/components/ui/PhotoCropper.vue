<script setup lang="ts">
const props = withDefaults(defineProps<{ file: File; aspect?: number }>(), { aspect: 4 / 3 });

const emit = defineEmits<{ confirm: [Blob]; cancel: [] }>();

const MIN_SIZE = 60;
type Corner = 'tl' | 'tr' | 'bl' | 'br';

const imgUrl = URL.createObjectURL(props.file);
const imgEl = ref<HTMLImageElement | null>(null);
const boxEl = ref<HTMLDivElement | null>(null);
const stageEl = ref<HTMLDivElement | null>(null);

const ready = ref(false);
const naturalW = ref(0);
const naturalH = ref(0);
const dispW = ref(0);
const dispH = ref(0);

const rect = reactive({ x: 0, y: 0, w: 0, h: 0 });

let dragMode: 'move' | Corner | null = null;
let dragStartX = 0;
let dragStartY = 0;
let rectStart = { x: 0, y: 0, w: 0, h: 0 };

function initRect() {
  let w: number;
  let h: number;
  if (dispW.value / dispH.value > props.aspect) {
    h = dispH.value;
    w = h * props.aspect;
  } else {
    w = dispW.value;
    h = w / props.aspect;
  }
  rect.w = w;
  rect.h = h;
  rect.x = (dispW.value - w) / 2;
  rect.y = (dispH.value - h) / 2;
}

function onImageLoad() {
  const el = imgEl.value;
  const box = boxEl.value;
  if (!el || !box) return;
  naturalW.value = el.naturalWidth;
  naturalH.value = el.naturalHeight;

  const fitScale = Math.min(box.clientWidth / naturalW.value, box.clientHeight / naturalH.value);
  dispW.value = naturalW.value * fitScale;
  dispH.value = naturalH.value * fitScale;

  initRect();
  ready.value = true;
}

function stagePoint(e: PointerEvent) {
  const stageRect = stageEl.value!.getBoundingClientRect();
  return { x: e.clientX - stageRect.left, y: e.clientY - stageRect.top };
}

function onRectPointerDown(e: PointerEvent) {
  dragMode = 'move';
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  rectStart = { ...rect };
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
}

function onHandlePointerDown(e: PointerEvent, corner: Corner) {
  e.stopPropagation();
  dragMode = corner;
  rectStart = { ...rect };
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
}

function resizeCorner(corner: Corner, px: number, py: number) {
  const aspect = props.aspect;
  const horizSign = corner === 'tr' || corner === 'br' ? 1 : -1;
  const vertSign = corner === 'bl' || corner === 'br' ? 1 : -1;
  const anchorX = horizSign === 1 ? rectStart.x : rectStart.x + rectStart.w;
  const anchorY = vertSign === 1 ? rectStart.y : rectStart.y + rectStart.h;

  const maxW = horizSign === 1 ? dispW.value - anchorX : anchorX;
  const maxH = vertSign === 1 ? dispH.value - anchorY : anchorY;

  const wFromX = horizSign === 1 ? px - anchorX : anchorX - px;
  const wFromY = (vertSign === 1 ? py - anchorY : anchorY - py) * aspect;
  let w = Math.max(wFromX, wFromY);
  w = Math.min(Math.max(w, MIN_SIZE), maxW);
  let h = w / aspect;
  if (h > maxH) {
    h = maxH;
    w = h * aspect;
  }
  if (w < MIN_SIZE) {
    w = MIN_SIZE;
    h = w / aspect;
  }

  rect.x = horizSign === 1 ? anchorX : anchorX - w;
  rect.y = vertSign === 1 ? anchorY : anchorY - h;
  rect.w = w;
  rect.h = h;
}

function onStagePointerMove(e: PointerEvent) {
  if (!dragMode) return;
  if (dragMode === 'move') {
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    rect.x = Math.min(Math.max(rectStart.x + dx, 0), dispW.value - rectStart.w);
    rect.y = Math.min(Math.max(rectStart.y + dy, 0), dispH.value - rectStart.h);
    return;
  }
  const p = stagePoint(e);
  resizeCorner(dragMode, p.x, p.y);
}

function onStagePointerUp() {
  dragMode = null;
}

async function confirm() {
  const outputW = 1200;
  const outputH = Math.round(outputW / props.aspect);
  const canvas = document.createElement('canvas');
  canvas.width = outputW;
  canvas.height = outputH;
  const ctx = canvas.getContext('2d');
  if (!ctx || !imgEl.value) return;

  const fitScale = dispW.value / naturalW.value;
  const sourceX = rect.x / fitScale;
  const sourceY = rect.y / fitScale;
  const sourceW = rect.w / fitScale;
  const sourceH = rect.h / fitScale;

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

const HANDLES: { corner: Corner; style: Record<string, string> }[] = [
  { corner: 'tl', style: { left: '0', top: '0', transform: 'translate(-50%, -50%)', cursor: 'nwse-resize' } },
  { corner: 'tr', style: { right: '0', top: '0', transform: 'translate(50%, -50%)', cursor: 'nesw-resize' } },
  { corner: 'bl', style: { left: '0', bottom: '0', transform: 'translate(-50%, 50%)', cursor: 'nesw-resize' } },
  { corner: 'br', style: { right: '0', bottom: '0', transform: 'translate(50%, 50%)', cursor: 'nwse-resize' } },
];
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

    <div ref="boxEl" style="width: 100%; max-width: 460px; height: 55vh; display: flex; align-items: center; justify-content: center">
      <div
        ref="stageEl"
        :style="{
          position: 'relative',
          width: ready ? `${dispW}px` : '0px',
          height: ready ? `${dispH}px` : '0px',
          overflow: 'hidden',
          borderRadius: '4px',
          touchAction: 'none',
        }"
        @pointermove="onStagePointerMove"
        @pointerup="onStagePointerUp"
        @pointercancel="onStagePointerUp"
      >
        <img
          ref="imgEl"
          :src="imgUrl"
          alt="Photo being cropped"
          draggable="false"
          style="width: 100%; height: 100%; display: block; user-select: none"
          @load="onImageLoad"
        />

        <div
          v-if="ready"
          :style="{
            position: 'absolute',
            left: `${rect.x}px`,
            top: `${rect.y}px`,
            width: `${rect.w}px`,
            height: `${rect.h}px`,
            boxSizing: 'border-box',
            border: '1.5px solid var(--brass-bright)',
            boxShadow: '0 0 0 9999px rgba(6,5,4,0.65)',
            cursor: 'move',
          }"
          @pointerdown="onRectPointerDown"
        >
          <div
            v-for="h in HANDLES"
            :key="h.corner"
            :style="{
              position: 'absolute',
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: 'var(--brass-bright)',
              boxShadow: '0 0 0 3px rgba(6,5,4,0.5)',
              ...h.style,
            }"
            @pointerdown="onHandlePointerDown($event, h.corner)"
          />
        </div>
      </div>
    </div>

    <div style="display: flex; gap: 10px; width: 100%; max-width: 460px">
      <UiGhostButton style="flex: 1" @click="emit('cancel')">Cancel</UiGhostButton>
      <UiPrimaryButton style="flex: 1" :disabled="!ready" @click="confirm">
        <Icon name="check" :size="17" :stroke="2" /> Use photo
      </UiPrimaryButton>
    </div>
  </div>
</template>
