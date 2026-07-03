<script setup lang="ts">
const reference = useReferenceStore();
const wishlist = useWishlistStore();

const WISH_ICON: Record<string, string> = {
  'Travel Size': 'gift',
  'Full Size': 'gift',
  'Body Wash': 'droplet',
  'Body Lotion': 'waves',
  'Body Mist': 'waves',
  'Body Oil': 'droplet',
  'Perfume Oil': 'flask',
};

const categories = computed(() => reference.wishCategories.map((c) => c.name));

const filledCount = computed(() => categories.value.filter((c) => (wishlist.notesByCategory[c] || '').trim()).length);

function onChange(cat: string, v: string) {
  wishlist.setNote(cat, v);
}
</script>

<template>
  <div style="flex: 1; display: flex; flex-direction: column; min-height: 0">
    <AppHeader :kicker="`${filledCount} of ${categories.length} noted`" title="Wish List" />
    <div class="ol-scroll" style="flex: 1; padding: 14px 18px 18px">
      <p style="margin: 0 0 16px; font-size: 13px; color: var(--text-dim); line-height: 1.55">Jot down what you're hunting for under each category.</p>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px">
        <div
          v-for="cat in categories"
          :key="cat"
          :style="{
            background: 'var(--surface-2)', borderRadius: '15px',
            boxShadow: `inset 0 0 0 1px ${(wishlist.notesByCategory[cat] || '').trim() ? 'rgba(198,161,91,0.28)' : 'var(--hairline)'}`,
            padding: '13px 14px',
          }"
        >
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px">
            <span style="width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: rgba(198,161,91,0.1); color: var(--brass)">
              <Icon :name="WISH_ICON[cat] || 'gift'" :size="16" />
            </span>
            <span style="font-family: var(--serif); font-size: 18px; color: var(--text-hi)">{{ cat }}</span>
            <span v-if="(wishlist.notesByCategory[cat] || '').trim()" style="margin-left: auto; width: 7px; height: 7px; border-radius: 50%; background: var(--brass)" />
          </div>
          <UiTextArea
            :model-value="wishlist.notesByCategory[cat] || ''"
            :placeholder="`What ${cat.toLowerCase()} are you looking for?`"
            :rows="3"
            @update:model-value="onChange(cat, $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
