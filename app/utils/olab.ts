// app/utils/olab.ts — pure helpers ported from the MyOlfactoryLab design (data.jsx).
// Layer keys are no longer a fixed constant (layers are per-user editable, see stores/reference.ts
// in a later task), so any function that needs them takes `layerKeys: string[]` as a parameter.

export type Tab = 'combos' | 'wish' | 'report' | 'notes';

export interface Combo {
  id: string | null;
  name: string;
  layers: Record<string, string[]>;
  season: string[];
  highHeat: boolean;
  vibe: string;
  secondaryVibe: string;
  favorite: boolean;
  rating: number;
  longevity: number;
  projection: number;
  note: string;
  history: string[];
  photoKey: string | null;
}

export const LONGEVITY_LABELS: Record<number, string> = { 0: 'Not rated', 1: 'Short', 2: 'Medium', 3: 'Long' };
export const PROJECTION_LABELS: Record<number, string> = { 0: 'Not rated', 1: 'Soft', 2: 'Moderate', 3: 'Strong' };
export const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter', 'Year-Round'];

const SEASON_ICONS: Record<string, string> = {
  Spring: 'droplet',
  Summer: 'sun',
  Fall: 'leaf',
  Winter: 'waves',
  'Year-Round': 'cycle',
};

export function seasonIcon(season: string): string {
  return SEASON_ICONS[season] ?? 'sun';
}

export function daysSince(dateStr: string | null, now = new Date().toISOString().slice(0, 10)): number | null {
  if (!dateStr) return null;
  const a = new Date(dateStr + 'T00:00:00');
  const b = new Date(now + 'T00:00:00');
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export function prettyDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function layerArr(combo: Combo, k: string): string[] {
  const v = combo.layers && combo.layers[k];
  return Array.isArray(v) ? v : v ? [v] : [];
}

export function comboSeasons(combo: Combo): string[] {
  return Array.isArray(combo.season) ? combo.season : combo.season ? [combo.season as unknown as string] : [];
}

export function filledLayers(combo: Combo, layerKeys: string[]): string[] {
  return layerKeys.filter((k) => layerArr(combo, k).length);
}

export function allScents(combo: Combo, layerKeys: string[]): string[] {
  return layerKeys.flatMap((k) => layerArr(combo, k));
}

export function comboTitle(combo: Combo, layerKeys: string[]): string {
  if (combo.name && combo.name.trim()) return combo.name.trim();
  const scents = allScents(combo, layerKeys);
  if (!scents.length) return 'Untitled Combo';
  const pt = layerArr(combo, 'perfumesToppers');
  const lead = pt.length ? pt[0] : scents[0];
  const othersCount = scents.length - 1;
  return othersCount > 0 ? `${lead} + ${othersCount} other${othersCount === 1 ? '' : 's'}` : lead;
}

export function history(combo: Combo): string[] {
  return Array.isArray(combo.history) ? combo.history : [];
}

export function lastUsed(combo: Combo): string | null {
  const h = history(combo);
  if (!h.length) return null;
  return [...h].sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
}

export function usesWithin(combo: Combo, days: number): number {
  return history(combo).filter((d) => {
    const n = daysSince(d);
    return n !== null && n >= 0 && n <= days;
  }).length;
}

export function usageCounts(combo: Combo) {
  return {
    m1: usesWithin(combo, 30),
    m3: usesWithin(combo, 91),
    m6: usesWithin(combo, 182),
    total: history(combo).length,
  };
}

export function lastUsedMono(combo: Combo): string {
  const d = daysSince(lastUsed(combo));
  if (d === null) return 'NEVER USED';
  if (d <= 0) return 'USED TODAY';
  if (d === 1) return 'USED 1D AGO';
  if (d < 30) return `USED ${d}D AGO`;
  const w = Math.round(d / 7);
  return w < 8 ? `USED ${w}W AGO` : `USED ${Math.round(d / 30)}MO AGO`;
}

export function newCombo(layerKeys: string[]): Combo {
  return {
    id: null,
    name: '',
    layers: Object.fromEntries(layerKeys.map((k) => [k, []])),
    season: [],
    highHeat: false,
    vibe: '',
    secondaryVibe: '',
    favorite: false,
    rating: 0,
    longevity: 0,
    projection: 0,
    note: '',
    history: [],
    photoKey: null,
  };
}
