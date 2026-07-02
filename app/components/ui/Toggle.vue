<script setup lang="ts">
withDefaults(defineProps<{ modelValue: boolean }>(), {});

defineEmits<{ 'update:modelValue': [value: boolean] }>();
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :style="{
      width: '42px',
      height: '24px',
      borderRadius: '999px',
      background: modelValue ? 'var(--brass)' : 'var(--surface-3)',
      border: '1px solid var(--hairline)',
      position: 'relative',
      transition: 'background 0.15s ease',
      flexShrink: 0,
    }"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span
      :style="{
        position: 'absolute',
        top: '2px',
        left: modelValue ? '20px' : '2px',
        width: '18px',
        height: '18px',
        borderRadius: '999px',
        background: 'var(--text-hi)',
        transition: 'left 0.15s ease',
      }"
    />
  </button>
</template>
