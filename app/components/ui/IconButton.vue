<script setup lang="ts">
withDefaults(defineProps<{ icon: string; size?: number; disabled?: boolean }>(), {
  size: 18,
  disabled: false,
});
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    style="
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: transparent;
      color: var(--text);
      transition: background 0.15s ease, color 0.15s ease, opacity 0.15s ease;
    "
    :style="disabled ? { opacity: 0.4, cursor: 'not-allowed' } : {}"
  >
    <Icon :name="icon" :size="size" />
  </button>
</template>

<style scoped>
button:not(:disabled):hover {
  background: var(--surface-3);
  color: var(--brass-bright);
}
</style>
