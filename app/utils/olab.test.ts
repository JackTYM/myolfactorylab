import { describe, it, expect } from 'vitest';
import { daysSince, comboTitle, usageCounts, lastUsedMono } from './olab';
import type { Combo } from './olab';

function stubCombo(overrides: Partial<Combo> = {}): Combo {
  return {
    id: '1', name: '', layers: {}, season: 'Spring/Summer', highHeat: false, vibe: '',
    favorite: false, rating: 0, longevity: 0, projection: 0, note: '', history: [], photoKey: null,
    ...overrides,
  };
}

describe('daysSince', () => {
  it('returns 0 for the same day', () => {
    expect(daysSince('2026-07-02', '2026-07-02')).toBe(0);
  });
  it('returns null for a missing date', () => {
    expect(daysSince(null, '2026-07-02')).toBeNull();
  });
  it('counts whole days between two dates', () => {
    expect(daysSince('2026-06-20', '2026-07-02')).toBe(12);
  });
});

describe('comboTitle', () => {
  const layerKeys = ['bodyWash', 'perfumesToppers'];
  it('prefers the explicit name', () => {
    expect(comboTitle(stubCombo({ name: 'Beach Vanilla' }), layerKeys)).toBe('Beach Vanilla');
  });
  it('falls back to the first perfume/topper when unnamed', () => {
    expect(comboTitle(stubCombo({ layers: { perfumesToppers: ['Vanilla Bean'] } }), layerKeys)).toBe('Vanilla Bean');
  });
  it('falls back to Untitled Combo when nothing is filled', () => {
    expect(comboTitle(stubCombo(), layerKeys)).toBe('Untitled Combo');
  });
});

describe('usageCounts', () => {
  it('buckets history entries into 1/3/6 month windows', () => {
    const iso = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString().slice(0, 10);
    const counts = usageCounts(stubCombo({ history: [iso(5), iso(60), iso(150)] }));
    expect(counts.total).toBe(3);
    expect(counts.m1).toBe(1);
    expect(counts.m3).toBe(2);
    expect(counts.m6).toBe(3);
  });
});

describe('lastUsedMono', () => {
  it('reports NEVER USED when history is empty', () => {
    expect(lastUsedMono(stubCombo({ history: [] }))).toBe('NEVER USED');
  });
  it('reports USED TODAY for a same-day entry', () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(lastUsedMono(stubCombo({ history: [today] }))).toBe('USED TODAY');
  });
});
