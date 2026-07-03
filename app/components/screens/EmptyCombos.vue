<script setup lang="ts">
defineEmits<{ new: [] }>();
</script>

<template>
  <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 54px 34px">
    <div
      style="
        width: 88px; height: 88px; border-radius: 24px; display: flex; align-items: center; justify-content: center;
        background: linear-gradient(160deg, var(--surface-hi), var(--surface-1)); box-shadow: inset 0 0 0 1px var(--hairline);
        color: var(--brass); margin-bottom: 24px;
      "
    >
      <Icon name="beaker" :size="40" :stroke="1.3" />
    </div>
    <div class="kicker" style="margin-bottom: 12px">No Combos Yet</div>
    <h1 style="margin: 0; font-family: var(--serif); font-weight: 500; font-size: 28px; line-height: 1.1; color: var(--text-hi)">Build your first<br />layering combo</h1>
    <p style="margin: 14px 0 26px; font-size: 14px; line-height: 1.6; color: var(--text-dim); max-width: 280px">Add a photo, pick a scent for each layer, tag the season and vibe, and rate how much you love it.</p>
    <UiPrimaryButton @click="$emit('new')"><Icon name="plus" :size="18" :stroke="2" /> New combo</UiPrimaryButton>
  </div>
</template>
