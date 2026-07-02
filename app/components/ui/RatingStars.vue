<script setup lang="ts">
withDefaults(defineProps<{ value: number; max?: number; size?: number; readonly?: boolean }>(), {
  max: 5,
  size: 18,
  readonly: false,
});

const emit = defineEmits<{ setRating: [n: number] }>();

function starsRange(max: number): number[] {
  return Array.from({ length: max }, (_, i) => i + 1);
}

function pick(n: number, value: number, readonly: boolean) {
  if (readonly) return;
  // Clicking the currently-set star clears the rating (toggle back to 0).
  emit('setRating', n === value ? 0 : n);
}
</script>

<template>
  <div style="display: inline-flex; align-items: center; gap: 3px">
    <button
      v-for="n in starsRange(max)"
      :key="n"
      type="button"
      :disabled="readonly"
      :style="{
        display: 'flex',
        color: n <= value ? 'var(--brass)' : 'var(--hairline)',
        cursor: readonly ? 'default' : 'pointer',
      }"
      @click="pick(n, value, readonly)"
    >
      <Icon name="star" :size="size" :fill="n <= value" />
    </button>
  </div>
</template>
