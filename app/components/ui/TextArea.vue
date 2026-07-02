<script setup lang="ts">
withDefaults(defineProps<{ modelValue: string; placeholder?: string; rows?: number }>(), {
  placeholder: '',
  rows: 4,
});

defineEmits<{ 'update:modelValue': [value: string] }>();
</script>

<template>
  <textarea
    :value="modelValue"
    :placeholder="placeholder"
    :rows="rows"
    style="
      width: 100%;
      padding: 11px 14px;
      border-radius: 12px;
      background: var(--surface-2);
      border: 1px solid var(--hairline);
      color: var(--text-hi);
      font-size: 14px;
      resize: vertical;
      line-height: 1.5;
    "
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>

<style scoped>
textarea::placeholder {
  color: var(--text-faint);
}
textarea:focus {
  outline: none;
  border-color: var(--brass);
}
</style>
