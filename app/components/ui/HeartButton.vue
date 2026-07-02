<script setup lang="ts">
withDefaults(defineProps<{ active: boolean; size?: number }>(), { size: 20 });

defineEmits<{ toggle: [] }>();
</script>

<template>
  <button
    type="button"
    aria-label="Toggle favorite"
    :style="{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '34px',
      height: '34px',
      borderRadius: '999px',
      background: active ? 'rgba(178,60,74,0.15)' : 'var(--surface-2)',
      border: active ? '1px solid var(--fam-amber)' : '1px solid var(--hairline)',
      color: active ? 'var(--fam-amber)' : 'var(--text-dim)',
      transition: 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease',
    }"
    @click.stop="$emit('toggle')"
  >
    <Icon name="heart" :size="size" :fill="active" />
  </button>
</template>
