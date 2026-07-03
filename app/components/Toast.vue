<script setup lang="ts">
withDefaults(defineProps<{ message: string | null; navHidden?: boolean }>(), { navHidden: false });
</script>

<template>
  <div
    v-if="message"
    :key="message"
    :style="{
      position: 'absolute', left: 0, right: 0, bottom: navHidden ? '92px' : '108px',
      display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 70,
    }"
  >
    <div
      style="
        display: inline-flex; align-items: center; gap: 9px; padding: 11px 16px; border-radius: 999px;
        background: rgba(36,29,21,0.96); box-shadow: 0 10px 30px rgba(0,0,0,0.5), inset 0 0 0 1px var(--hairline);
        color: var(--text-hi); font-size: 13px; font-weight: 500; animation: ol-fade-up .26s ease;
      "
    >
      <Icon name="check" :size="16" :stroke="2" style="color: var(--brass-bright)" />{{ message }}
    </div>
  </div>
</template>
