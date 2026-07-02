<script setup lang="ts">
withDefaults(defineProps<{ padding?: string }>(), { padding: '16px' });
</script>

<template>
  <div
    :style="{
      background: 'var(--surface-2)',
      border: '1px solid var(--hairline)',
      borderRadius: '16px',
      padding,
    }"
  >
    <slot />
  </div>
</template>
