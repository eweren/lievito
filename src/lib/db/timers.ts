// Timer-CRUD. State wird persistent in IndexedDB gespeichert. Beim
// Re-Open der App rekonstruieren wir Restzeiten anhand der Wall-Clock,
// nicht über `setInterval`-Akkumulation – das übersteht Tabs-Schlafen
// und Service-Worker-Reset.

import { CURRENT_SCHEMA_VERSION } from '$lib/types/schema';
import type { TimerSession, TimerStep } from '$lib/types/schema';
import { getDb } from './index';

export interface NewTimerInput {
  label: string;
  steps: { label: string; durationSec: number }[];
}

export async function listTimers(): Promise<TimerSession[]> {
  return getDb().timers.orderBy('startedAt').reverse().toArray();
}

export async function getTimer(id: string): Promise<TimerSession | undefined> {
  return getDb().timers.get(id);
}

export async function startTimer(input: NewTimerInput): Promise<TimerSession> {
  const now = Date.now();
  const session: TimerSession = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    id: crypto.randomUUID(),
    label: input.label,
    startedAt: now,
    steps: input.steps.map((s) => ({ ...s })) as TimerStep[],
    currentStepIndex: 0,
    status: 'running'
  };
  session.steps[0].startedAt = now;
  await getDb().timers.add(session);
  return session;
}

export async function pauseTimer(id: string): Promise<void> {
  const t = await getTimer(id);
  if (!t || t.status !== 'running') return;
  await getDb().timers.update(id, { status: 'paused' });
}

export async function resumeTimer(id: string): Promise<void> {
  const t = await getTimer(id);
  if (!t || t.status !== 'paused') return;
  await getDb().timers.update(id, { status: 'running' });
}

export async function abandonTimer(id: string): Promise<void> {
  await getDb().timers.update(id, { status: 'abandoned' });
}

export async function completeStep(id: string): Promise<TimerSession | undefined> {
  const db = getDb();
  return db.transaction('rw', db.timers, async () => {
    const t = await db.timers.get(id);
    if (!t || t.status !== 'running') return t;
    const now = Date.now();
    t.steps[t.currentStepIndex].completedAt = now;
    if (t.currentStepIndex + 1 < t.steps.length) {
      t.currentStepIndex++;
      t.steps[t.currentStepIndex].startedAt = now;
    } else {
      t.status = 'completed';
    }
    await db.timers.put(t);
    return t;
  });
}

export async function deleteTimer(id: string): Promise<void> {
  await getDb().timers.delete(id);
}

/**
 * Berechnet die Restzeit des aktuellen Schritts in Sekunden.
 * Negativ = bereits abgelaufen.
 */
export function remainingSec(session: TimerSession, now = Date.now()): number {
  const step = session.steps[session.currentStepIndex];
  if (!step?.startedAt) return step?.durationSec ?? 0;
  if (session.status !== 'running') {
    return Math.max(0, step.durationSec - Math.floor((now - step.startedAt) / 1000));
  }
  return step.durationSec - Math.floor((now - step.startedAt) / 1000);
}

export function formatRemaining(sec: number): string {
  const sign = sec < 0 ? '-' : '';
  const abs = Math.abs(Math.floor(sec));
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  if (h > 0) return `${sign}${h}:${pad(m)}:${pad(s)}`;
  return `${sign}${pad(m)}:${pad(s)}`;
}
