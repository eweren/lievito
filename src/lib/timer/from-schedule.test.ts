import { describe, expect, it } from 'vitest';
import { splitMaturation } from '$lib/dough/calculate';
import { timerFromSplit } from './from-schedule';

describe('timerFromSplit', () => {
  it('erzeugt 2 Schritte für Warmgare (kein Kühlschrank)', () => {
    const split = splitMaturation(24, 20);
    const t = timerFromSplit('Test', split);
    expect(t.steps).toHaveLength(2);
    expect(t.steps[0].label).toContain('Stockgare');
    expect(t.steps[1].label).toContain('Stückgare');
    const totalSec = t.steps.reduce((s, x) => s + x.durationSec, 0);
    expect(totalSec).toBe(24 * 3600);
  });

  it('erzeugt 3 Schritte für Kaltgare', () => {
    const split = splitMaturation(48, 4);
    const t = timerFromSplit('Test', split);
    expect(t.steps).toHaveLength(3);
    expect(t.steps[1].label).toContain('Kühlschrank');
    const totalSec = t.steps.reduce((s, x) => s + x.durationSec, 0);
    expect(totalSec).toBe(48 * 3600);
  });
});
