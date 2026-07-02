<script setup lang="ts">
withDefaults(defineProps<{ modelValue: string; options: string[] }>(), {
  options: () => [],
});

defineEmits<{ 'update:modelValue': [value: string] }>();
</script>

<template>
  <div
    style="
      display: inline-flex;
      padding: 3px;
      border-radius: 12px;
      background: var(--surface-2);
      border: 1px solid var(--hairline);
      gap: 2px;
    "
  >
    <button
      v-for="opt in options"
      :key="opt"
      type="button"
      :style="{
        padding: '7px 14px',
        borderRadius: '9px',
        fontSize: '13px',
        fontWeight: 500,
        background: opt === modelValue ? 'var(--brass)' : 'transparent',
        color: opt === modelValue ? 'var(--ink-950)' : 'var(--text-dim)',
        transition: 'background 0.15s ease, color 0.15s ease',
      }"
      @click="$emit('update:modelValue', opt)"
    >
      {{ opt }}
    </button>
  </div>
</template>
