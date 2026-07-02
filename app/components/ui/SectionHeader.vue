<script setup lang="ts">
withDefaults(defineProps<{ title: string; kicker?: string }>(), { kicker: '' });
</script>

<template>
  <div style="display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; margin-bottom: 12px">
    <div>
      <div v-if="kicker" class="kicker" style="margin-bottom: 4px">{{ kicker }}</div>
      <div class="serif" style="font-size: 18px; color: var(--text-hi); font-weight: 600">{{ title }}</div>
    </div>
    <div style="display: flex; align-items: center; gap: 8px">
      <slot />
    </div>
  </div>
</template>
