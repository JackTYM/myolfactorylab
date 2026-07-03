<script setup lang="ts">
withDefaults(defineProps<{ icon?: string; color?: string; fill?: boolean }>(), {
  icon: '',
  color: 'var(--text-dim)',
  fill: false,
});
</script>

<template>
  <span
    :style="{
      display: 'inline-flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--mono)', fontSize: '9px',
      letterSpacing: '0.06em', textTransform: 'uppercase', color,
    }"
  >
    <Icon v-if="icon" :name="icon" :size="12" :fill="fill" :style="{ color }" />
    <slot />
  </span>
</template>
