<script setup lang="ts">
defineProps<{ value: number; label: string; color: string }>();
</script>

<template>
  <div style="flex: 1; background: var(--surface-1); border-radius: 13px; padding: 12px 12px; box-shadow: inset 0 0 0 1px var(--hairline)">
    <div :style="{ fontFamily: 'var(--serif)', fontSize: '26px', color, lineHeight: 1 }">{{ value }}</div>
    <div class="kicker" style="font-size: 8px; margin-top: 7px">{{ label }}</div>
  </div>
</template>
