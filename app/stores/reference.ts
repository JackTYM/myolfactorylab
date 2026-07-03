import { defineStore } from 'pinia';
import { DEFAULT_LAYERS, DEFAULT_SCENTS, DEFAULT_VIBES, DEFAULT_WISH_CATEGORIES } from '~/utils/seedData';

export const useReferenceStore = defineStore('reference', () => {
  const layers = ref<any[]>([]);
  const vibes = ref<any[]>([]);
  const scents = ref<any[]>([]);
  const wishCategories = ref<any[]>([]);
  const loaded = ref(false);

  async function fetchAll() {
    const neon = useNeon();
    const [l, v, s, w] = await Promise.all([
      neon.from('layers').select('*').order('sort_order', { ascending: true }),
      neon.from('vibes').select('*').order('sort_order', { ascending: true }),
      neon.from('scents').select('*').order('name', { ascending: true }),
      neon.from('wish_categories').select('*').order('sort_order', { ascending: true }),
    ]);
    layers.value = l.data ?? [];
    vibes.value = v.data ?? [];
    scents.value = s.data ?? [];
    wishCategories.value = w.data ?? [];
  }

  async function seed() {
    const neon = useNeon();
    await neon.from('layers').insert(
      DEFAULT_LAYERS.map((l, i) => ({ key: l.key, label: l.label, short_label: l.shortLabel, sort_order: i }))
    );
    await neon.from('vibes').insert(
      DEFAULT_VIBES.map((v, i) => ({
        name: v.name, color: v.color, logic: v.logic, weight: v.weight,
        secret_word: v.secretWord, secret_text: v.secretText, best_for: v.bestFor, sort_order: i,
      }))
    );
    await neon.from('scents').insert(DEFAULT_SCENTS.map((s) => ({ name: s.name, layers: s.layers })));
    await neon.from('wish_categories').insert(
      DEFAULT_WISH_CATEGORIES.map((name, i) => ({ name, sort_order: i }))
    );
  }

  async function load() {
    await fetchAll();
    if (layers.value.length === 0) {
      await seed();
      await fetchAll();
    }
    loaded.value = true;
  }

  function scentsForLayer(layerKey: string): string[] {
    return scents.value.filter((s) => (s.layers || []).includes(layerKey)).map((s) => s.name);
  }

  function layerKeys(): string[] {
    return layers.value.map((l) => l.key);
  }

  return { layers, vibes, scents, wishCategories, loaded, load, scentsForLayer, layerKeys };
});
