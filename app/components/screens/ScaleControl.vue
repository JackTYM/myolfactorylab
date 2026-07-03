<script setup lang="ts">
defineProps<{ label: string; icon: string; value: number; labels: Record<number, string> }>();

const emit = defineEmits<{ 'update:value': [n: number] }>();

function pick(n: number, value: number) {
  emit('update:value', n === value ? 0 : n);
}
</script>

<template>
  <div style="flex: 1; padding: 13px 14px; border-radius: 14px; background: var(--surface-2); box-shadow: inset 0 0 0 1px var(--hairline)">
    <div style="display: flex; align-items: center; gap: 7px; margin-bottom: 11px">
      <Icon :name="icon" :size="14" style="color: var(--brass)" />
      <span class="kicker" style="font-size: 8.5px">{{ label }}</span>
    </div>
    <div style="display: flex; gap: 5px">
      <button
        v-for="n in [1, 2, 3]"
        :key="n"
        type="button"
        :style="{
          flex: 1, height: '30px', borderRadius: '8px',
          background: n <= value ? 'var(--brass)' : 'rgba(247,239,222,0.04)',
          boxShadow: n <= value ? 'none' : 'inset 0 0 0 1px var(--hairline)',
          transition: 'all .12s',
        }"
        @click="pick(n, value)"
      />
    </div>
    <div :style="{ marginTop: '9px', fontFamily: 'var(--serif)', fontSize: '14px', color: value ? 'var(--text-hi)' : 'var(--text-faint)' }">{{ labels[value] }}</div>
  </div>
</template>
