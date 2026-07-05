<script setup lang="ts">
const props = withDefaults(
  defineProps<{ name: string; size?: number; stroke?: number; fill?: boolean }>(),
  { size: 24, stroke: 1.6, fill: false }
);

const S = 'fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"';

// Verbatim transcription of icons.jsx's `paths` map (JSX -> inner SVG markup).
const STATIC_PATHS: Record<string, string> = {
  droplet: `<path ${S} d="M12 3.2C12 3.2 5.5 10 5.5 14.5a6.5 6.5 0 0013 0C18.5 10 12 3.2 12 3.2z" />`,
  rack: `<g ${S}><rect x="5" y="3.5" width="3.4" height="11" rx="0.8" /><rect x="10.3" y="3.5" width="3.4" height="11" rx="0.8" /><rect x="15.6" y="3.5" width="3.4" height="11" rx="0.8" /><path d="M3.5 16.5h17M5.5 16.5l1 4h11l1-4" /></g>`,
  beaker: `<g ${S}><path d="M9 3h6M10 3v6.5L5.6 17.4A2 2 0 007.4 20.5h9.2a2 2 0 001.8-3.1L14 9.5V3" /><path d="M7.7 14h8.6" /></g>`,
  bookmark: `<path ${S} d="M6.5 4.5h11a1 1 0 011 1v14l-6.5-4-6.5 4v-14a1 1 0 011-1z" />`,
  more: `<g ${S}><circle cx="5.5" cy="12" r="1.3" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" /><circle cx="18.5" cy="12" r="1.3" fill="currentColor" stroke="none" /></g>`,
  plus: `<path ${S} d="M12 5v14M5 12h14" />`,
  close: `<path ${S} d="M6 6l12 12M18 6L6 18" />`,
  chevronRight: `<path ${S} d="M9 5l7 7-7 7" />`,
  chevronLeft: `<path ${S} d="M15 5l-7 7 7 7" />`,
  chevronDown: `<path ${S} d="M5 9l7 7 7-7" />`,
  arrowRight: `<path ${S} d="M4 12h15M13 6l6 6-6 6" />`,
  arrowUp: `<path ${S} d="M12 19V5M6 11l6-6 6 6" />`,
  check: `<path ${S} d="M5 12.5l4.5 4.5L19 6.5" />`,
  regenerate: `<g ${S}><path d="M20 11a8 8 0 10-1.6 5.4" /><path d="M20 4v5h-5" /></g>`,
  lock: `<g ${S}><rect x="5.5" y="10.5" width="13" height="9" rx="2" /><path d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5" /></g>`,
  unlock: `<g ${S}><rect x="5.5" y="10.5" width="13" height="9" rx="2" /><path d="M8.5 10.5V8a3.5 3.5 0 016.9-1" /></g>`,
  edit: `<path ${S} d="M16.5 4.5l3 3L9 18l-4 1 1-4 10.5-10.5zM14.5 6.5l3 3" />`,
  search: `<g ${S}><circle cx="11" cy="11" r="6" /><path d="M15.5 15.5L20 20" /></g>`,
  filter: `<path ${S} d="M4 6h16M7 12h10M10 18h4" />`,
  sort: `<path ${S} d="M4 7h10M4 12h7M4 17h4M16 5v14M16 19l3-3M16 19l-3-3" />`,
  grid: `<g ${S}><rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" /></g>`,
  list: `<path ${S} d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />`,
  calendar: `<g ${S}><rect x="4" y="5.5" width="16" height="15" rx="2" /><path d="M4 9.5h16M8 3.5v4M16 3.5v4" /></g>`,
  gift: `<g ${S}><rect x="4" y="9" width="16" height="11" rx="1.5" /><path d="M4 13h16M12 9v11M12 9s-1.2-4-3.6-4A2.4 2.4 0 008.4 9zM12 9s1.2-4 3.6-4A2.4 2.4 0 0115.6 9z" /></g>`,
  chart: `<g ${S}><path d="M4 20h16" /><rect x="6" y="12" width="3" height="6" rx="0.6" /><rect x="11" y="8" width="3" height="10" rx="0.6" /><rect x="16" y="14" width="3" height="4" rx="0.6" /></g>`,
  gear: `<g ${S}><circle cx="12" cy="12" r="3" /><path d="M12 2.8v2.4M12 18.8v2.4M21.2 12h-2.4M5.2 12H2.8M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7M18.5 18.5l-1.7-1.7M7.2 7.2L5.5 5.5" /></g>`,
  flask: `<g ${S}><path d="M10 3h4M11 3v5.5L6.4 17a2.2 2.2 0 002 3.3h7.2a2.2 2.2 0 002-3.3L13 8.5V3" /><circle cx="11" cy="14.5" r="0.8" fill="currentColor" stroke="none" /><circle cx="14" cy="16.5" r="0.6" fill="currentColor" stroke="none" /></g>`,
  waves: `<path ${S} d="M3 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />`,
  info: `<g ${S}><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 8h.01" /></g>`,
  bell: `<g ${S}><path d="M6 16V11a6 6 0 1112 0v5l1.5 2.5h-15L6 16z" /><path d="M10 20a2 2 0 004 0" /></g>`,
  target: `<g ${S}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3.4" /><path d="M12 1.5v3M12 19.5v3M22.5 12h-3M4.5 12h-3" /></g>`,
  drop_log: `<g ${S}><path d="M12 3.5C12 3.5 6.5 9.5 6.5 13.7a5.5 5.5 0 0011 0C17.5 9.5 12 3.5 12 3.5z" /><path d="M9.5 14l1.8 1.8L15 12.3" /></g>`,
  camera: `<g ${S}><path d="M4 8.5h3l1.3-2h7.4L17 8.5h3a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1v-8a1 1 0 011-1z" /><circle cx="12" cy="13" r="3.2" /></g>`,
  nose: `<path ${S} d="M12 4v6c0 1.5-1 2-1 3.5M9 16c-1.5-.5-2.5-2-2-4M12 4c2.5 1.5 4 4 4 7.5a4.5 4.5 0 01-9 0M9.5 16.5a3 3 0 005 0" />`,
  flame: `<path ${S} d="M12 3s5 4 5 9a5 5 0 01-10 0c0-1.6.7-2.9 1.5-3.8 0 1.3 1 2.3 2 2.3 1.3 0 1.6-1.4 1-2.8-.7-1.6-.5-3.6.5-4.9z" />`,
  sun: `<g ${S}><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2.4M12 19.1v2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7" /></g>`,
  leaf: `<path ${S} d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14zM5 19c3.5-4 6.5-6 10-8" />`,
  cycle: `<g ${S}><path d="M7 7h8a4 4 0 0 1 4 4v1M17 17H9a4 4 0 0 1-4-4v-1" /><path d="M13 3l2 4-2 4M11 21l-2-4 2-4" /></g>`,
  trash: `<g ${S}><path d="M4.5 6.5h15M9 6.5V5a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0115 5v1.5M6.5 6.5l1 12a1.5 1.5 0 001.5 1.4h6a1.5 1.5 0 001.5-1.4l1-12" /><path d="M10 10.5v6M14 10.5v6" /></g>`,
  tag: `<g ${S}><path d="M4 12.5V5.5a1.5 1.5 0 011.5-1.5h7l7.5 7.5a1.5 1.5 0 010 2.1l-6.9 6.9a1.5 1.5 0 01-2.1 0L4 12.5z" /><circle cx="8.5" cy="8.5" r="1.3" fill="currentColor" stroke="none" /></g>`,
  note: `<g ${S}><path d="M6 3.5h9L19 7.5v11a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 015 18.5V5A1.5 1.5 0 016 3.5z" /><path d="M14 3.5V8h4.5M8.5 12.5h7M8.5 16h5" /></g>`,
  save: `<g ${S}><path d="M5 4.5h11l3 3V18a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 015 18V6a1.5 1.5 0 010-1.5z" /><path d="M8 4.5v4h6v-4M8 19.5v-5h8v5" /></g>`,
};

const inner = computed(() => {
  if (props.name === 'heart') {
    return `<path fill="${props.fill ? 'currentColor' : 'none'}" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M12 20s-7-4.6-7-9.4A3.9 3.9 0 0112 8a3.9 3.9 0 017 2.6C19 15.4 12 20 12 20z" />`;
  }
  if (props.name === 'star') {
    return `<path fill="${props.fill ? 'currentColor' : 'none'}" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8L3.5 9.7l5.9-.9L12 3.5z" />`;
  }
  return STATIC_PATHS[props.name] ?? '';
});
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    :style="{ display: 'block', flexShrink: 0, strokeWidth: stroke }"
    v-html="inner"
  />
</template>
