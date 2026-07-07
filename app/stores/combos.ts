import { defineStore } from 'pinia';
import type { Combo } from '~/utils/olab';

export const useCombosStore = defineStore('combos', () => {
  const combos = ref<Combo[]>([]);
  const loaded = ref(false);

  async function load() {
    const neon = useNeon();
    const { data } = await neon.from('combos').select('*').order('created_at', { ascending: false });
    combos.value = (data ?? []).map(fromRow);
    loaded.value = true;
  }

  function fromRow(row: any): Combo {
    return {
      id: row.id, name: row.name, layers: row.layers ?? {},
      season: Array.isArray(row.season) ? row.season : row.season ? [row.season] : [],
      highHeat: row.high_heat, vibe: row.vibe, secondaryVibe: row.secondary_vibe, favorite: row.favorite, rating: row.rating,
      longevity: row.longevity, projection: row.projection, note: row.note,
      history: row.history ?? [], photoKey: row.photo_key,
    };
  }

  function toRow(combo: Combo) {
    return {
      name: combo.name, layers: combo.layers, season: combo.season, high_heat: combo.highHeat,
      vibe: combo.vibe, secondary_vibe: combo.secondaryVibe, favorite: combo.favorite, rating: combo.rating, longevity: combo.longevity,
      projection: combo.projection, note: combo.note, history: combo.history, photo_key: combo.photoKey,
      updated_at: new Date().toISOString(),
    };
  }

  async function save(combo: Combo): Promise<Combo> {
    const neon = useNeon();
    if (combo.id) {
      const { data } = await neon.from('combos').update(toRow(combo)).eq('id', combo.id).select().single();
      const saved = fromRow(data);
      combos.value = combos.value.map((c) => (c.id === saved.id ? saved : c));
      return saved;
    }
    const { data } = await neon.from('combos').insert(toRow(combo)).select().single();
    const saved = fromRow(data);
    combos.value = [saved, ...combos.value];
    return saved;
  }

  async function remove(id: string) {
    const neon = useNeon();
    await neon.from('combos').delete().eq('id', id);
    combos.value = combos.value.filter((c) => c.id !== id);
  }

  async function toggleFavorite(id: string) {
    const combo = combos.value.find((c) => c.id === id);
    if (!combo) return;
    await save({ ...combo, favorite: !combo.favorite });
  }

  async function setRating(id: string, rating: number) {
    const combo = combos.value.find((c) => c.id === id);
    if (!combo) return;
    await save({ ...combo, rating });
  }

  return { combos, loaded, load, save, remove, toggleFavorite, setRating };
});
