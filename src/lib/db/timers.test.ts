import { describe, expect, it } from 'vitest';
import { formatRemaining, remainingSec } from './timers';
import { CURRENT_SCHEMA_VERSION } from '$lib/types/schema';
import type { TimerSession } from '$lib/types/schema';

describe('formatRemaining', () => {
  it('formatiert Stunden:Minuten:Sekunden für lange Timer', () => {
    expect(formatRemaining(3725)).toBe('1:02:05');
  });
  it('formatiert Minuten:Sekunden unter einer Stunde', () => {
    expect(formatRemaining(125)).toBe('02:05');
  });
  it('zeigt negatives Vorzeichen für Überzeit', () => {
    expect(formatRemaining(-10)).toBe('-00:10');
  });
});

describe('remainingSec', () => {
  it('gibt verbleibende Zeit unter Wall-Clock korrekt zurück', () => {
    const start = 10_000;
    const session: TimerSession = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      id: 't1',
      label: 'Stockgare',
      startedAt: start,
      currentStepIndex: 0,
      status: 'running',
      steps: [{ label: 's1', durationSec: 600, startedAt: start }]
    };
    expect(remainingSec(session, start + 60_000)).toBe(540);
    expect(remainingSec(session, start + 700_000)).toBe(-100);
  });

  it('frisst keine Zeit, wenn pausiert (clamps auf >= 0)', () => {
    const start = 10_000;
    const session: TimerSession = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      id: 't1',
      label: 'Stockgare',
      startedAt: start,
      currentStepIndex: 0,
      status: 'paused',
      steps: [{ label: 's1', durationSec: 600, startedAt: start }]
    };
    expect(remainingSec(session, start + 700_000)).toBe(0);
  });
});
