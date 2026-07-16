<script setup lang="ts">
withDefaults(defineProps<{ icon: string; title: string; desc: string; modelValue: boolean; color?: string }>(), { color: 'var(--brass)' });

defineEmits<{ 'update:modelValue': [value: boolean] }>();
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 13px; background: var(--surface-2); box-shadow: inset 0 0 0 1px var(--hairline)">
    <span
      :style="{
        width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: modelValue ? `color-mix(in srgb, ${color} 12%, transparent)` : 'rgba(247,239,222,0.04)',
        color: modelValue ? color : 'var(--text-faint)',
      }"
    >
      <Icon :name="icon" :size="18" />
    </span>
    <div style="flex: 1; min-width: 0">
      <div style="font-size: 14.5px; color: var(--text-hi); font-weight: 500">{{ title }}</div>
      <div style="font-size: 11.5px; color: var(--text-dim); margin-top: 2px">{{ desc }}</div>
    </div>
    <UiToggle :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" />
  </div>
</template>
