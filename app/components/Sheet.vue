<script setup lang="ts">
withDefaults(defineProps<{ title: string; height?: string }>(), { height: '' });

defineEmits<{ close: [] }>();
</script>

<template>
  <div style="position: absolute; inset: 0; z-index: 80; display: flex; flex-direction: column; justify-content: flex-end">
    <div
      style="position: absolute; inset: 0; background: rgba(6,5,4,0.6); backdrop-filter: blur(2px); animation: ol-fade .2s ease"
      @click="$emit('close')"
    />
    <div
      :style="{
        position: 'relative', background: 'var(--surface-1)', borderRadius: '22px 22px 0 0',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.5), inset 0 1px 0 var(--hairline)',
        maxHeight: height || '82%', display: 'flex', flexDirection: 'column',
        animation: 'ol-fade-up .26s cubic-bezier(.2,.8,.2,1)',
      }"
    >
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 18px 12px; flex-shrink: 0">
        <div style="width: 36px; height: 4px; border-radius: 2px; background: var(--hairline); position: absolute; top: 8px; left: 50%; transform: translateX(-50%)" />
        <h3 style="margin: 0; font-family: var(--serif); font-size: 20px; color: var(--text-hi); font-weight: 600">{{ title }}</h3>
        <button
          type="button"
          style="width: 32px; height: 32px; border-radius: 9px; display: flex; align-items: center; justify-content: center; color: var(--text-dim); background: rgba(247,239,222,0.04)"
          @click="$emit('close')"
        >
          <Icon name="close" :size="16" />
        </button>
      </div>
      <div class="ol-scroll" style="padding: 0 18px 22px">
        <slot />
      </div>
    </div>
  </div>
</template>
