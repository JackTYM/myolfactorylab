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
  let loadPromise: Promise<void> | null = null;

  async function fetchAll() {
    const neon = useNeon();
    const [l, v, s, w] = await Promise.all([
      neon.from('layers').select('*').order('sort_order', { ascending: true }),
      neon.from('vibes').select('*').order('sort_order', { ascending: true }),
      neon.from('scents').select('*').order('name', { ascending: true }),
      neon.from('wish_categories').select('*').order('sort_order', { ascending: true }),
    ]);
    if (l.error || v.error || s.error || w.error) {
      throw new Error('Failed to load reference data: ' + (l.error || v.error || s.error || w.error)?.message);
    }
    layers.value = (l.data ?? []).map(layerFromRow);
    vibes.value = (v.data ?? []).map(vibeFromRow);
    scents.value = (s.data ?? []).map(scentFromRow);
    wishCategories.value = (w.data ?? []).map(wishCategoryFromRow);
  }

  async function seed() {
    const neon = useNeon();
    if (layers.value.length === 0) {
      const { error } = await neon.from('layers').insert(
        DEFAULT_LAYERS.map((l, i) => ({ key: l.key, label: l.label, short_label: l.shortLabel, sort_order: i }))
      );
      if (error) throw new Error('Failed to seed layers: ' + error.message);
    }
    if (vibes.value.length === 0) {
      const { error } = await neon.from('vibes').insert(
        DEFAULT_VIBES.map((v, i) => ({
          name: v.name, color: v.color, logic: v.logic, weight: v.weight,
          secret_word: v.secretWord, secret_text: v.secretText, best_for: v.bestFor, sort_order: i,
        }))
      );
      if (error) throw new Error('Failed to seed vibes: ' + error.message);
    }
    if (scents.value.length === 0) {
      const { error } = await neon.from('scents').insert(DEFAULT_SCENTS.map((s) => ({ name: s.name, layers: s.layers })));
      if (error) throw new Error('Failed to seed scents: ' + error.message);
    }
    if (wishCategories.value.length === 0) {
      const { error } = await neon.from('wish_categories').insert(
        DEFAULT_WISH_CATEGORIES.map((name, i) => ({ name, sort_order: i }))
      );
      if (error) throw new Error('Failed to seed wish categories: ' + error.message);
    }
  }

  async function load() {
    // Guard against concurrent callers (e.g. app.vue's onMounted + watch both
    // firing right after sign-in) triggering fetchAll/seed at the same time,
    // which can race and attempt to insert duplicate seed rows.
    if (loadPromise) return loadPromise;
    loadPromise = (async () => {
      await fetchAll();
      const needsSeed = layers.value.length === 0 || vibes.value.length === 0 || scents.value.length === 0 || wishCategories.value.length === 0;
      if (needsSeed) {
        await seed();
        await fetchAll();
      }
      loaded.value = true;
    })().catch((err) => {
      loadPromise = null;
      throw err;
    });
    return loadPromise;
  }

  async function addScent(name: string, layerKey: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const neon = useNeon();
    const existing = scents.value.find((s) => s.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      if (existing.layers.includes(layerKey)) return;
      const nextLayers = [...existing.layers, layerKey];
      const { error } = await neon.from('scents').update({ layers: nextLayers }).eq('id', existing.id);
      if (error) throw new Error('Failed to update scent: ' + error.message);
      existing.layers = nextLayers;
    } else {
      const { data, error } = await neon.from('scents').insert({ name: trimmed, layers: [layerKey] }).select().single();
      if (error) throw new Error('Failed to add scent: ' + error.message);
      scents.value.push(scentFromRow(data));
    }
    scents.value.sort((a, b) => a.name.localeCompare(b.name));
  }

  function scentsForLayer(layerKey: string): string[] {
    return scents.value.filter((s) => (s.layers || []).includes(layerKey)).map((s) => s.name);
  }

  function layerKeys(): string[] {
    return layers.value.map((l) => l.key);
  }

  function reset() {
    layers.value = [];
    vibes.value = [];
    scents.value = [];
    wishCategories.value = [];
    loaded.value = false;
    loadPromise = null;
  }

  return { layers, vibes, scents, wishCategories, loaded, load, scentsForLayer, layerKeys, addScent, reset };
});
