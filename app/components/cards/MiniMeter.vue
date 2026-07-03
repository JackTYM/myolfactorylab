<script setup lang="ts">
defineProps<{ label: string; value: number }>();
</script>

<template>
  <span style="display: inline-flex; align-items: center; gap: 7px">
    <span class="mono" style="font-size: 8.5px; color: var(--text-faint); letter-spacing: 0.06em; text-transform: uppercase">{{ label }}</span>
    <span style="display: inline-flex; gap: 3px">
      <span
        v-for="n in [1, 2, 3]"
        :key="n"
        :style="{ width: '12px', height: '4px', borderRadius: '2px', background: n <= value ? 'var(--brass)' : 'rgba(198,161,91,0.16)' }"
      />
    </span>
  </span>
</template>
