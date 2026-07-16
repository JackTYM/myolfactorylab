import { defineStore } from 'pinia';

export const useWishlistStore = defineStore('wishlist', () => {
  const notesByCategory = ref<Record<string, string>>({});
  const loaded = ref(false);
  const pendingSaves: Record<string, ReturnType<typeof setTimeout>> = {};

  async function load() {
    const neon = useNeon();
    const { data } = await neon.from('wishlist').select('category, note');
    const map: Record<string, string> = {};
    for (const row of data ?? []) map[row.category] = row.note;
    notesByCategory.value = map;
    loaded.value = true;
  }

  function setNote(category: string, note: string) {
    notesByCategory.value = { ...notesByCategory.value, [category]: note };

    clearTimeout(pendingSaves[category]);
    pendingSaves[category] = setTimeout(async () => {
      const neon = useNeon();
      const { data: existing } = await neon.from('wishlist').select('id').eq('category', category);
      if (existing && existing.length > 0) {
        await neon.from('wishlist').update({ note }).eq('category', category);
      } else {
        await neon.from('wishlist').insert({ category, note });
      }
    }, 400);
  }

  return { notesByCategory, loaded, load, setNote };
});
