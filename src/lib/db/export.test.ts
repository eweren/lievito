// Test des Export-Bundle-Format-Roundtrips. Wir testen nur die
// reine Validierung und die JSON-Roundtrip-Symmetrie der Schema-
// Daten – die IndexedDB-Roundtrip-Tests sind manuell zu fahren,
// weil sie Browser-APIs brauchen.

import { describe, expect, it } from 'vitest';
import { CURRENT_SCHEMA_VERSION } from '$lib/types/schema';
import type { ExportBundle } from '$lib/types/schema';

const sample: ExportBundle = {
  exportVersion: 1,
  exportedAt: 1735689600000,
  appVersion: '0.1.0',
  schemaVersion: CURRENT_SCHEMA_VERSION,
  bakes: [
    {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      id: 'b1',
      createdAt: 1735689600000,
      bakedAt: 1735689600000,
      rating: 5,
      notes: 'Glücksrolle',
      photoIds: ['p1'],
      ovenType: 'forno',
      ovenTemp: 450,
      bakingTimeSec: 90,
      tags: ['margherita']
    }
  ],
  photos: [
    {
      id: 'p1',
      bakeId: 'b1',
      dataUrl: 'data:image/jpeg;base64,AAAA',
      width: 1600,
      height: 1200,
      takenAt: 1735689600000
    }
  ],
  timerSessions: [],
  chatMessages: undefined,
  settings: {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    units: 'metric',
    theme: 'auto',
    defaultStyle: 'neapoletana'
  }
};

describe('ExportBundle JSON roundtrip', () => {
  it('serialisiert und parst verlustfrei', () => {
    const json = JSON.stringify(sample);
    const parsed = JSON.parse(json) as ExportBundle;
    expect(parsed.exportVersion).toBe(1);
    expect(parsed.bakes).toHaveLength(1);
    expect(parsed.photos[0].dataUrl).toBe(sample.photos[0].dataUrl);
    expect(parsed.bakes[0].tags).toEqual(['margherita']);
  });

  it('hat die Pflichtfelder für die Validierung', () => {
    expect(sample.exportVersion).toBe(1);
    expect(Array.isArray(sample.bakes)).toBe(true);
    expect(Array.isArray(sample.photos)).toBe(true);
  });
});
