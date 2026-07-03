<script setup lang="ts">
withDefaults(defineProps<{ title: string; kicker?: string }>(), { kicker: '' });
</script>

<template>
  <div style="display: flex; align-items: flex-end; justify-content: space-between; padding: 10px 18px 4px">
    <div>
      <div class="kicker" style="margin-bottom: 5px">{{ kicker }}</div>
      <h1 style="margin: 0; font-family: var(--serif); font-weight: 500; font-size: 28px; color: var(--text-hi); line-height: 1">{{ title }}</h1>
    </div>
    <div style="display: flex; align-items: center; gap: 8px">
      <slot name="right" />
    </div>
  </div>
</template>
