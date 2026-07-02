<script setup lang="ts">
withDefaults(defineProps<{ modelValue: boolean; label?: string }>(), { label: '' });

defineEmits<{ 'update:modelValue': [value: boolean] }>();
</script>

<template>
  <button
    type="button"
    role="checkbox"
    :aria-checked="modelValue"
    style="display: inline-flex; align-items: center; gap: 8px; color: var(--text)"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span
      :style="{
        width: '20px',
        height: '20px',
        borderRadius: '6px',
        border: modelValue ? '1px solid var(--brass)' : '1px solid var(--hairline)',
        background: modelValue ? 'var(--brass)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'background 0.15s ease, border-color 0.15s ease',
      }"
    >
      <Icon v-if="modelValue" name="check" :size="14" :stroke="2.4" style="color: var(--ink-950)" />
    </span>
    <span v-if="label" style="font-size: 14px">{{ label }}</span>
  </button>
</template>
