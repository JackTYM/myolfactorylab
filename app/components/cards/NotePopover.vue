<script setup lang="ts">
const props = defineProps<{ note: string; anchorRect: DOMRect }>();
defineEmits<{ close: [] }>();

const MAX_WIDTH = 220;
const GAP = 8;
const MARGIN = 8;
const MIN_SPACE_ABOVE = 120;

const bubbleStyle = computed(() => {
  const left = Math.max(MARGIN, Math.min(props.anchorRect.right - MAX_WIDTH, window.innerWidth - MAX_WIDTH - MARGIN));
  const openUpward = props.anchorRect.top >= MIN_SPACE_ABOVE;
  return {
    position: 'fixed' as const,
    left: `${left}px`,
    maxWidth: `${MAX_WIDTH}px`,
    ...(openUpward
      ? { top: `${props.anchorRect.top - GAP}px`, transform: 'translateY(-100%)' }
      : { top: `${props.anchorRect.bottom + GAP}px` }),
  };
});
</script>

<template>
  <Teleport to="body">
    <div style="position: fixed; inset: 0; z-index: 90" @click="$emit('close')">
      <div
        :style="{
          ...bubbleStyle,
          padding: '10px 12px',
          borderRadius: '12px',
          background: 'var(--surface-1)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 0 0 1px var(--hairline)',
          color: 'var(--text)',
          fontSize: '13px',
          lineHeight: '1.4',
          whiteSpace: 'pre-wrap',
        }"
        @click.stop
      >
        {{ note }}
      </div>
    </div>
  </Teleport>
</template>
