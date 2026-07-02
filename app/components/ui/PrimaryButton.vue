<script setup lang="ts">
withDefaults(defineProps<{ disabled?: boolean }>(), { disabled: false });
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    class="sans"
    style="
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 11px 20px;
      border-radius: 12px;
      background: var(--brass);
      color: var(--ink-950);
      font-weight: 600;
      font-size: 14px;
      transition: background 0.15s ease, opacity 0.15s ease;
    "
    :style="disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}"
  >
    <slot />
  </button>
</template>

<style scoped>
button:not(:disabled):hover {
  background: var(--brass-bright);
}
</style>
