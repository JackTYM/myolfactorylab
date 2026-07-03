import { defineStore } from 'pinia';
import { DEFAULT_LAYERS, DEFAULT_SCENTS, DEFAULT_VIBES, DEFAULT_WISH_CATEGORIES } from '~/utils/seedData';

export interface Layer {
  id: string;
  key: string;
  label: string;
  shortLabel: string;
  sortOrder: number;
}

export interface Vibe {
  id: string;
  name: string;
  color: string;
  logic: string;
  weight: string;
  secretWord: string;
  secretText: string;
  bestFor: string;
  sortOrder: number;
}

export interface Scent {
  id: string;
  name: string;
  layers: string[];
}

export interface WishCategory {
  id: string;
  name: string;
  sortOrder: number;
}

function layerFromRow(row: any): Layer {
  return { id: row.id, key: row.key, label: row.label, shortLabel: row.short_label, sortOrder: row.sort_order };
}

function vibeFromRow(row: any): Vibe {
  return {
    id: row.id, name: row.name, color: row.color, logic: row.logic, weight: row.weight,
    secretWord: row.secret_word, secretText: row.secret_text, bestFor: row.best_for, sortOrder: row.sort_order,
  };
}

function scentFromRow(row: any): Scent {
  return { id: row.id, name: row.name, layers: row.layers ?? [] };
}

function wishCategoryFromRow(row: any): WishCategory {
  return { id: row.id, name: row.name, sortOrder: row.sort_order };
}

export const useReferenceStore = defineStore('reference', () => {
  const layers = ref<Layer[]>([]);
  const vibes = ref<Vibe[]>([]);
  const scents = ref<Scent[]>([]);
  const wishCategories = ref<WishCategory[]>([]);
  const loaded = ref(false);

  async function fetchAll() {
    const neon = useNeon();
    const [l, v, s, w] = await Promise.all([
      neon.from('layers').select('*').order('sort_order', { ascending: true }),
      neon.from('vibes').select('*').order('sort_order', { ascending: true }),
      neon.from('scents').select('*').order('name', { ascending: true }),
      neon.from('wish_categories').select('*').order('sort_order', { ascending: true }),
    ]);
    layers.value = (l.data ?? []).map(layerFromRow);
    vibes.value = (v.data ?? []).map(vibeFromRow);
    scents.value = (s.data ?? []).map(scentFromRow);
    wishCategories.value = (w.data ?? []).map(wishCategoryFromRow);
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
