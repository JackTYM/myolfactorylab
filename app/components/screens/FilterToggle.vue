<script setup lang="ts">
defineProps<{ icon: string; label: string; modelValue: boolean }>();

defineEmits<{ 'update:modelValue': [value: boolean] }>();
</script>

<template>
  <div
    :style="{
      display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 13px', borderRadius: '12px',
      background: modelValue ? 'rgba(198,161,91,0.07)' : 'var(--surface-2)',
      boxShadow: `inset 0 0 0 1px ${modelValue ? 'rgba(198,161,91,0.4)' : 'var(--hairline)'}`,
      cursor: 'pointer',
    }"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span style="width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: rgba(198,161,91,0.1); color: var(--brass); flex-shrink: 0">
      <Icon :name="icon" :size="16" />
    </span>
    <span style="flex: 1; font-size: 14px; color: var(--text-hi); font-weight: 500">{{ label }}</span>
    <UiToggle :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" @click.stop />
  </div>
</template>
