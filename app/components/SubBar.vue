<script setup lang="ts">
withDefaults(defineProps<{ title: string; kicker?: string }>(), { kicker: '' });

defineEmits<{ back: [] }>();
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-bottom: 1px solid var(--hairline-soft); flex-shrink: 0">
    <button
      type="button"
      style="
        width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center;
        background: rgba(247,239,222,0.04); box-shadow: inset 0 0 0 1px var(--hairline); color: var(--text); flex-shrink: 0;
      "
      @click="$emit('back')"
    >
      <Icon name="chevronLeft" :size="18" />
    </button>
    <div style="flex: 1; min-width: 0">
      <div v-if="kicker" class="kicker" style="font-size: 9px; margin-bottom: 2px">{{ kicker }}</div>
      <div style="font-family: var(--serif); font-size: 19px; color: var(--text-hi); line-height: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ title }}</div>
    </div>
    <slot name="action" />
  </div>
</template>
