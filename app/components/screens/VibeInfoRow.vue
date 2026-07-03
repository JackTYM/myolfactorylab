<script setup lang="ts">
defineProps<{ label: string; accent: string }>();
</script>

<template>
  <div style="display: flex; gap: 10px">
    <span :style="{ width: '3px', alignSelf: 'stretch', borderRadius: '3px', background: accent, flexShrink: 0, opacity: 0.7 }" />
    <div style="flex: 1; min-width: 0">
      <div class="kicker" style="font-size: 8.5px; margin-bottom: 4px">{{ label }}</div>
      <p style="margin: 0; font-size: 13px; line-height: 1.5; color: var(--text-dim)"><slot /></p>
    </div>
  </div>
</template>
