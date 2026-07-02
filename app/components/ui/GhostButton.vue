<script setup lang="ts">
withDefaults(defineProps<{ disabled?: boolean }>(), { disabled: false });
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    style="
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 12px;
      background: transparent;
      border: 1px solid var(--hairline);
      color: var(--text);
      font-weight: 500;
      font-size: 14px;
      transition: border-color 0.15s ease, color 0.15s ease, opacity 0.15s ease;
    "
    :style="disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}"
  >
    <slot />
  </button>
</template>

<style scoped>
button:not(:disabled):hover {
  border-color: var(--brass);
  color: var(--text-hi);
}
</style>
