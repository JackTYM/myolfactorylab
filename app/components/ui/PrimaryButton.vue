<script setup lang="ts">
const props = withDefaults(
  defineProps<{ disabled?: boolean; tone?: 'brass' | 'dark' | 'danger'; full?: boolean }>(),
  { disabled: false, tone: 'brass', full: false }
);

const TONES = {
  brass: { bg: 'var(--brass)', fg: 'var(--ink-950)', hoverBg: 'var(--brass-bright)' },
  dark: { bg: 'var(--surface-3)', fg: 'var(--text-hi)', hoverBg: 'var(--surface-hi)' },
  danger: { bg: 'rgba(178,60,74,0.15)', fg: 'var(--fam-amber)', hoverBg: 'rgba(178,60,74,0.25)' },
};

const hovering = ref(false);
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    class="sans"
    :style="{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      width: full ? '100%' : undefined,
      padding: '11px 20px',
      borderRadius: '12px',
      background: hovering && !disabled ? TONES[tone].hoverBg : TONES[tone].bg,
      color: TONES[tone].fg,
      fontWeight: 600,
      fontSize: '14px',
      transition: 'background 0.15s ease, opacity 0.15s ease',
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
    }"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
  >
    <slot />
  </button>
</template>
