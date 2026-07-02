<script setup lang="ts">
withDefaults(defineProps<{ name: string; color?: string; small?: boolean }>(), {
  color: 'var(--brass)',
  small: false,
});
</script>

<template>
  <span
    class="mono"
    :style="{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      fontSize: small ? '9px' : '10px', textTransform: 'uppercase', letterSpacing: '0.04em',
      color: 'var(--text-dim)',
    }"
  >
    <span :style="{ width: '7px', height: '7px', borderRadius: '50%', background: color, flexShrink: 0 }" />
    {{ name }}
  </span>
</template>
