<script setup lang="ts">
withDefaults(defineProps<{ modelValue: string; placeholder?: string; type?: string }>(), {
  placeholder: '',
  type: 'text',
});

defineEmits<{ 'update:modelValue': [value: string] }>();
</script>

<template>
  <input
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    style="
      width: 100%;
      padding: 11px 14px;
      border-radius: 12px;
      background: var(--surface-2);
      border: 1px solid var(--hairline);
      color: var(--text-hi);
      font-size: 14px;
    "
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>

<style scoped>
input::placeholder {
  color: var(--text-faint);
}
input:focus {
  outline: none;
  border-color: var(--brass);
}
</style>
