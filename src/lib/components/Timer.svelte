<script lang="ts">
  import { onDestroy } from 'svelte';
  import Button from './Button.svelte';
  import {
    abandonTimer,
    completeStep,
    formatRemaining,
    pauseTimer,
    remainingSec,
    resumeTimer
  } from '$lib/db/timers';
  import type { TimerSession } from '$lib/types/schema';

  interface Props {
    session: TimerSession;
    onchange?: (session: TimerSession) => void;
  }
  let { session, onchange }: Props = $props();

  let now = $state(Date.now());
  const tick = setInterval(() => (now = Date.now()), 1000);
  onDestroy(() => clearInterval(tick));

  const remaining = $derived(remainingSec(session, now));
  const totalSec = $derived(session.steps[session.currentStepIndex]?.durationSec ?? 0);
  const progress = $derived(
    totalSec > 0 ? Math.min(1, Math.max(0, 1 - remaining / totalSec)) : 0
  );

  let alerted = $state(false);
  $effect(() => {
    if (session.status === 'running' && remaining <= 0 && !alerted) {
      alerted = true;
      ringBell();
    }
    if (remaining > 0 && alerted) alerted = false;
  });

  async function ringBell() {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification('Lievito Timer', {
          body: `${session.label} – ${session.steps[session.currentStepIndex]?.label} ist fertig.`,
          icon: '/icons/icon-192.png'
        });
      } catch {
        /* ignore */
      }
    }
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
    playBeep();
  }

  function playBeep() {
    if (typeof window === 'undefined' || !('AudioContext' in window)) return;
    try {
      const ctx = new AudioContext();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = 880;
      o.type = 'sine';
      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      o.start();
      o.stop(ctx.currentTime + 0.65);
    } catch {
      /* ignore */
    }
  }

  async function pause() {
    await pauseTimer(session.id);
    onchange?.({ ...session, status: 'paused' });
  }
  async function resume() {
    await resumeTimer(session.id);
    onchange?.({ ...session, status: 'running' });
  }
  async function next() {
    const updated = await completeStep(session.id);
    if (updated) onchange?.(updated);
  }
  async function abandon() {
    await abandonTimer(session.id);
    onchange?.({ ...session, status: 'abandoned' });
  }
</script>

<article class="timer" data-status={session.status}>
  <header>
    <h3>{session.label}</h3>
    <span class="step">
      Schritt {session.currentStepIndex + 1} / {session.steps.length}:
      {session.steps[session.currentStepIndex]?.label}
    </span>
  </header>

  <div class="display">
    <div class="ring" style="--progress:{progress}">
      <div class="value" class:over={remaining < 0}>{formatRemaining(remaining)}</div>
    </div>
  </div>

  <div class="controls">
    {#if session.status === 'running'}
      <Button variant="ghost" onclick={pause}>Pause</Button>
      <Button onclick={next}>Schritt fertig</Button>
    {:else if session.status === 'paused'}
      <Button onclick={resume}>Weiter</Button>
      <Button variant="ghost" onclick={abandon}>Abbrechen</Button>
    {:else if session.status === 'completed'}
      <p class="done">✓ Alle Schritte erledigt</p>
    {:else}
      <p class="abandoned">Abgebrochen</p>
    {/if}
  </div>
</article>

<style>
  .timer {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-5);
    display: grid;
    gap: var(--space-3);
  }
  .timer[data-status='paused'] {
    opacity: 0.7;
  }
  .timer[data-status='completed'] {
    border-color: var(--color-success);
  }
  header h3 {
    margin: 0;
    font-size: var(--text-lg);
  }
  .step {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }
  .display {
    display: grid;
    place-items: center;
  }
  .ring {
    --size: 8.5rem;
    width: var(--size);
    height: var(--size);
    border-radius: 50%;
    background: conic-gradient(
      var(--color-accent) calc(var(--progress) * 360deg),
      var(--color-bg) 0
    );
    display: grid;
    place-items: center;
    position: relative;
  }
  .ring::before {
    content: '';
    position: absolute;
    inset: 0.5rem;
    background: var(--color-surface);
    border-radius: 50%;
  }
  .value {
    position: relative;
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
    font-size: var(--text-2xl);
    color: var(--color-text);
  }
  .value.over {
    color: var(--color-accent);
  }
  .controls {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
    justify-content: center;
  }
  .done {
    color: var(--color-success);
  }
  .abandoned {
    color: var(--color-text-muted);
  }
</style>
