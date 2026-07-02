<script setup lang="ts">
withDefaults(defineProps<{ name: string; color?: string; selected?: boolean }>(), {
  color: 'var(--brass)',
  selected: false,
});

defineEmits<{ click: [] }>();
</script>

<template>
  <button
    type="button"
    :style="{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '7px',
      padding: '7px 14px',
      borderRadius: '999px',
      background: selected ? 'var(--surface-hi)' : 'var(--surface-2)',
      border: selected ? '1px solid var(--brass)' : '1px solid var(--hairline)',
      color: selected ? 'var(--text-hi)' : 'var(--text)',
      fontSize: '13px',
      fontWeight: 500,
      transition: 'border-color 0.15s ease, background 0.15s ease, color 0.15s ease',
    }"
    @click="$emit('click')"
  >
    <span :style="{ width: '9px', height: '9px', borderRadius: '999px', background: color, flexShrink: 0 }" />
    {{ name }}
  </button>
</template>
