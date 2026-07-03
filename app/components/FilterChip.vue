<script setup lang="ts">
withDefaults(defineProps<{ active?: boolean; color?: string }>(), { active: false, color: '' });

defineEmits<{ click: [] }>();
</script>

<template>
  <button
    type="button"
    :style="{
      display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 11px', borderRadius: '999px',
      fontSize: '11.5px', fontWeight: 500, whiteSpace: 'nowrap',
      background: active ? (color || 'var(--brass)') : 'rgba(247,239,222,0.04)',
      color: active ? '#1a1305' : 'var(--text-dim)',
    }"
    @click="$emit('click')"
  >
    <slot name="icon" />
    <slot />
  </button>
</template>
