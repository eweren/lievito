import { describe, expect, it } from 'vitest';
import { calculateDirectDough, suggestYeastPercent } from './calculate';
import { CURRENT_SCHEMA_VERSION } from '$lib/types/schema';
import type { DoughCalculationInput } from '$lib/types/schema';

const baseInput: DoughCalculationInput = {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  style: 'neapoletana',
  pizzaCount: 4,
  ballWeight: 250,
  hydration: 0.62,
  saltPercent: 2.8,
  yeastType: 'fresh',
  yeastPercent: 0.1,
  preFerment: 'none',
  maturationHours: 24,
  maturationTemp: 20,
  flourType: 'tipo00'
};

describe('calculateDirectDough', () => {
  it('verteilt Gesamtgewicht in sinnvolle Mehl/Wasser/Salz/Hefe-Mengen (Neapoletana 4×250g, 62%)', () => {
    const result = calculateDirectDough(baseInput);
    expect(result.totalDough).toBe(1000);
    // Mehl bei 62 % Hydration, 2.8 % Salz, 0.1 % Hefe → 1000 / 1.649 ≈ 606
    expect(result.flour).toBeGreaterThanOrEqual(602);
    expect(result.flour).toBeLessThanOrEqual(612);
    expect(result.water).toBeGreaterThanOrEqual(370);
    expect(result.water).toBeLessThanOrEqual(382);
    expect(result.salt).toBeCloseTo(result.flour * 0.028, 0);
    expect(result.yeast).toBeCloseTo(result.flour * 0.001, 1);
    expect(result.warnings).toHaveLength(0);
  });

  it('summiert exakt zum Gesamtgewicht (Konservierungsgesetz)', () => {
    const result = calculateDirectDough(baseInput);
    const sum = result.flour + result.water + result.salt + result.yeast;
    expect(Math.abs(sum - result.totalDough)).toBeLessThan(2); // Rundungsfehler-Toleranz
  });

  it('berücksichtigt Öl und Zucker (NY-Style)', () => {
    const result = calculateDirectDough({
      ...baseInput,
      style: 'ny',
      hydration: 0.63,
      oilPercent: 2,
      sugarPercent: 1.5
    });
    expect(result.oil).toBeDefined();
    expect(result.sugar).toBeDefined();
    expect(result.oil!).toBeCloseTo(result.flour * 0.02, 0);
    expect(result.sugar!).toBeCloseTo(result.flour * 0.015, 0);
  });

  it('skaliert linear mit Pizzaanzahl', () => {
    const a = calculateDirectDough(baseInput);
    const b = calculateDirectDough({ ...baseInput, pizzaCount: 8 });
    expect(b.totalDough).toBe(2 * a.totalDough);
    expect(Math.abs(b.flour - 2 * a.flour)).toBeLessThanOrEqual(2);
    expect(Math.abs(b.water - 2 * a.water)).toBeLessThanOrEqual(2);
  });

  it('warnt bei absurden Werten', () => {
    const result = calculateDirectDough({
      ...baseInput,
      hydration: 1.2,
      saltPercent: 0.2,
      maturationHours: 0
    });
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('berechnet Poolish-Vorteig getrennt vom Hauptteig', () => {
    const result = calculateDirectDough({
      ...baseInput,
      preFerment: 'poolish',
      preFermentRatio: 0.3
    });
    expect(result.preFerment).toBeDefined();
    expect(result.preFerment!.type).toBe('poolish');
    expect(result.preFerment!.flour).toBeCloseTo(result.flour * 0.3, 0);
    expect(result.preFerment!.water).toBeCloseTo(result.preFerment!.flour, 0);
    expect(result.mainDough).toBeDefined();
    expect(result.mainDough!.flour).toBeCloseTo(result.flour * 0.7, 0);
  });

  it('berechnet Biga (45% Hydration)', () => {
    const result = calculateDirectDough({
      ...baseInput,
      preFerment: 'biga',
      preFermentRatio: 0.5
    });
    expect(result.preFerment).toBeDefined();
    expect(result.preFerment!.water).toBeCloseTo(result.preFerment!.flour * 0.45, 0);
  });

  it('warnt wenn Vorteig-Hydration alles Wasser frisst', () => {
    const result = calculateDirectDough({
      ...baseInput,
      hydration: 0.55,
      preFerment: 'poolish',
      preFermentRatio: 0.65 // 65 % Mehl mal 100 % Wasser > Gesamtwasser
    });
    expect(result.warnings.some((w) => /Vorteig/i.test(w))).toBe(true);
  });
});

describe('suggestYeastPercent', () => {
  it('liefert ~0.1 % Frischhefe für 24h bei 20°C (Standard-Neapolitanisch)', () => {
    const v = suggestYeastPercent({ hours: 24, temp: 20, yeastType: 'fresh' });
    expect(v).toBeGreaterThan(0.04);
    expect(v).toBeLessThan(0.2);
  });

  it('skaliert nach unten mit Stunden', () => {
    const a = suggestYeastPercent({ hours: 8, temp: 20, yeastType: 'fresh' });
    const b = suggestYeastPercent({ hours: 24, temp: 20, yeastType: 'fresh' });
    expect(a).toBeGreaterThan(b);
  });

  it('verdreifacht Frisch- gegenüber Trockenhefe-Wirkung', () => {
    const fresh = suggestYeastPercent({ hours: 24, temp: 20, yeastType: 'fresh' });
    const dry = suggestYeastPercent({ hours: 24, temp: 20, yeastType: 'dry' });
    expect(fresh / dry).toBeCloseTo(3, 0);
  });

  it('reagiert exponentiell auf Temperatur', () => {
    const cold = suggestYeastPercent({ hours: 24, temp: 12, yeastType: 'fresh' });
    const warm = suggestYeastPercent({ hours: 24, temp: 32, yeastType: 'fresh' });
    expect(warm).toBeGreaterThan(cold * 2);
  });
});
