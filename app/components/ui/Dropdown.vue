<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: string | string[];
    options: string[];
    multi?: boolean;
    allowCustom?: boolean;
    placeholder?: string;
  }>(),
  { multi: false, allowCustom: false, placeholder: 'Select…' }
);

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]];
  customAdd: [value: string];
}>();

const root = ref<HTMLElement | null>(null);
const open = ref(false);
const customValue = ref('');

const selectedArr = computed<string[]>(() =>
  Array.isArray(props.modelValue) ? props.modelValue : props.modelValue ? [props.modelValue] : []
);

const triggerLabel = computed(() => {
  if (props.multi) {
    return selectedArr.value.length ? `${selectedArr.value.length} selected` : props.placeholder;
  }
  return selectedArr.value[0] || props.placeholder;
});

function isSelected(opt: string) {
  return selectedArr.value.includes(opt);
}

function toggleOpen() {
  open.value = !open.value;
}

function selectOption(opt: string) {
  if (props.multi) {
    const next = isSelected(opt) ? selectedArr.value.filter((o) => o !== opt) : [...selectedArr.value, opt];
    emit('update:modelValue', next);
  } else {
    emit('update:modelValue', opt);
    open.value = false;
  }
}

function removeChip(opt: string) {
  emit(
    'update:modelValue',
    props.multi ? selectedArr.value.filter((o) => o !== opt) : ''
  );
}

function addCustom() {
  const v = customValue.value.trim();
  if (!v) return;
  if (!props.options.includes(v)) emit('customAdd', v);
  if (props.multi) {
    if (!selectedArr.value.includes(v)) emit('update:modelValue', [...selectedArr.value, v]);
  } else {
    emit('update:modelValue', v);
    open.value = false;
  }
  customValue.value = '';
}

function onDocClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false;
}

onMounted(() => document.addEventListener('mousedown', onDocClick));
onUnmounted(() => document.removeEventListener('mousedown', onDocClick));
</script>

<template>
  <div ref="root" style="position: relative">
    <button
      type="button"
      style="
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 11px 14px;
        border-radius: 12px;
        background: var(--surface-2);
        border: 1px solid var(--hairline);
        color: var(--text-hi);
        font-size: 14px;
        text-align: left;
      "
      @click="toggleOpen"
    >
      <span :style="{ color: selectedArr.length ? 'var(--text-hi)' : 'var(--text-faint)' }">{{ triggerLabel }}</span>
      <Icon name="chevronDown" :size="16" :style="{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }" />
    </button>

    <div v-if="multi && selectedArr.length" style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px">
      <UiChip v-for="opt in selectedArr" :key="opt" :label="opt" removable @remove="removeChip(opt)" />
    </div>

    <div
      v-if="open"
      class="ol-scroll graph-tex"
      style="
        position: absolute;
        z-index: 20;
        top: calc(100% + 6px);
        left: 0;
        right: 0;
        max-height: 260px;
        overflow-y: auto;
        background: var(--surface-2);
        border: 1px solid var(--hairline);
        border-radius: 12px;
        padding: 6px;
        box-shadow: 0 12px 32px rgba(0,0,0,0.4);
      "
    >
      <button
        v-for="opt in options"
        :key="opt"
        type="button"
        :style="{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: '9px 10px',
          borderRadius: '8px',
          fontSize: '14px',
          color: isSelected(opt) ? 'var(--text-hi)' : 'var(--text)',
          background: isSelected(opt) ? 'var(--surface-hi)' : 'transparent',
        }"
        @click="selectOption(opt)"
      >
        <span>{{ opt }}</span>
        <Icon v-if="isSelected(opt)" name="check" :size="14" :stroke="2.2" style="color: var(--brass)" />
      </button>

      <div v-if="!options.length" style="padding: 10px; font-size: 13px; color: var(--text-faint)">No options</div>

      <div v-if="allowCustom" style="display: flex; gap: 6px; padding: 8px 4px 4px; border-top: 1px solid var(--hairline); margin-top: 6px">
        <input
          v-model="customValue"
          type="text"
          placeholder="Add custom…"
          style="
            flex: 1;
            min-width: 0;
            padding: 8px 10px;
            border-radius: 8px;
            background: var(--surface-1);
            border: 1px solid var(--hairline);
            color: var(--text-hi);
            font-size: 13px;
          "
          @keydown.enter.prevent="addCustom"
          @click.stop
        />
        <UiIconButton icon="plus" :size="16" @click.stop="addCustom" />
      </div>
    </div>
  </div>
</template>
