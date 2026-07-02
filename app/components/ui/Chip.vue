<script setup lang="ts">
withDefaults(defineProps<{ label: string; removable?: boolean; color?: string }>(), {
  removable: false,
  color: '',
});

defineEmits<{ remove: [] }>();
</script>

<template>
  <span
    class="mono"
    style="
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 999px;
      background: var(--surface-3);
      border: 1px solid var(--hairline);
      color: var(--text);
      font-size: 11px;
      line-height: 1.4;
    "
  >
    <span v-if="color" :style="{ width: '7px', height: '7px', borderRadius: '999px', background: color, flexShrink: 0 }" />
    {{ label }}
    <button
      v-if="removable"
      type="button"
      aria-label="Remove"
      style="display: flex; align-items: center; color: var(--text-faint); padding: 0"
      @click.stop="$emit('remove')"
    >
      <Icon name="close" :size="11" :stroke="2" />
    </button>
  </span>
</template>
