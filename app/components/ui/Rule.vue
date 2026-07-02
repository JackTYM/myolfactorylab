<script setup lang="ts">
withDefaults(defineProps<{ margin?: string }>(), { margin: '16px 0' });
</script>

<template>
  <div :style="{ height: '1px', background: 'var(--hairline)', margin }" />
</template>
