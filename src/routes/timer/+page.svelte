<script lang="ts">
  import { onMount } from 'svelte';
  import Button from '$lib/components/Button.svelte';
  import Card from '$lib/components/Card.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import Timer from '$lib/components/Timer.svelte';
  import { listTimers, startTimer, deleteTimer } from '$lib/db/timers';
  import type { TimerSession } from '$lib/types/schema';

  let timers = $state<TimerSession[]>([]);
  let loading = $state(true);

  // Builder-State
  let label = $state('Stockgare');
  type Step = { label: string; durationMin: number };
  let steps = $state<Step[]>([{ label: 'Stockgare', durationMin: 60 }]);

  onMount(async () => {
    timers = await listTimers();
    loading = false;
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      // Wir bitten nicht ungefragt – nur, wenn Nutzer einen Timer startet.
    }
  });

  async function requestNotificationPermission() {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch {
        /* ignore */
      }
    }
  }

  function addStep() {
    steps = [...steps, { label: '', durationMin: 30 }];
  }
  function removeStep(idx: number) {
    steps = steps.filter((_, i) => i !== idx);
  }

  async function start() {
    await requestNotificationPermission();
    const session = await startTimer({
      label,
      steps: steps.map((s) => ({ label: s.label, durationSec: Math.round(s.durationMin * 60) }))
    });
    timers = [session, ...timers];
  }

  async function remove(id: string) {
    await deleteTimer(id);
    timers = timers.filter((t) => t.id !== id);
  }

  function update(updated: TimerSession) {
    timers = timers.map((t) => (t.id === updated.id ? updated : t));
  }

  const activeTimers = $derived(
    timers.filter((t) => t.status === 'running' || t.status === 'paused')
  );
  const finishedTimers = $derived(
    timers.filter((t) => t.status === 'completed' || t.status === 'abandoned')
  );
</script>

<svelte:head>
  <title>Timer – Lievito</title>
</svelte:head>

<div class="container">
  <header class="page-header">
    <p class="kicker">Phase 2 · Secondo</p>
    <h1>Timer-Begleiter</h1>
    <p class="lead">
      Mehrere parallele Timer für Stockgare, Stückgare, Backzeit. Restzeit wird über die
      Wall-Clock berechnet — Tab schließen ist erlaubt.
    </p>
  </header>

  <Card title="Neuen Timer starten">
    <label class="field">
      <span>Bezeichnung</span>
      <input type="text" bind:value={label} placeholder="z. B. Margherita-Bake" />
    </label>

    <ol class="steps">
      {#each steps as step, i (i)}
        <li>
          <input
            type="text"
            placeholder="Schritt"
            value={step.label}
            oninput={(e) => (steps[i] = { ...step, label: (e.currentTarget as HTMLInputElement).value })}
          />
          <input
            type="number"
            min="1"
            max="2880"
            value={step.durationMin}
            oninput={(e) =>
              (steps[i] = { ...step, durationMin: Number((e.currentTarget as HTMLInputElement).value) })}
          />
          <span>min</span>
          {#if steps.length > 1}
            <button type="button" class="remove" onclick={() => removeStep(i)} aria-label="Schritt entfernen">
              ×
            </button>
          {/if}
        </li>
      {/each}
    </ol>

    <div class="row-actions">
      <Button variant="ghost" onclick={addStep}>+ Schritt</Button>
      <Button onclick={start}>Timer starten</Button>
    </div>
  </Card>

  {#if loading}
    <p>Lade…</p>
  {:else}
    {#if activeTimers.length}
      <section class="section">
        <h2>Aktive Timer</h2>
        <div class="grid">
          {#each activeTimers as t (t.id)}
            <div class="timer-wrap">
              <Timer session={t} onchange={update} />
              <button class="delete" type="button" onclick={() => remove(t.id)} aria-label="Timer löschen">
                Löschen
              </button>
            </div>
          {/each}
        </div>
      </section>
    {:else}
      <EmptyState
        title="Keine aktiven Timer"
        description="Starte einen Timer für die Stockgare oder Stückgare. Du kannst mehrere parallel laufen lassen."
        icon="⏱"
      />
    {/if}

    {#if finishedTimers.length}
      <section class="section">
        <h2>Verlauf</h2>
        <ul class="history">
          {#each finishedTimers as t (t.id)}
            <li>
              <span>{t.label}</span>
              <span class="status">{t.status}</span>
              <button type="button" onclick={() => remove(t.id)}>Entfernen</button>
            </li>
          {/each}
        </ul>
      </section>
    {/if}
  {/if}
</div>

<style>
  .page-header {
    margin-bottom: var(--space-6);
  }
  .kicker {
    color: var(--color-accent);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .lead {
    color: var(--color-text-muted);
    margin-top: var(--space-2);
  }
  .field {
    display: grid;
    gap: var(--space-1);
    margin-bottom: var(--space-3);
  }
  .field span {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }
  input {
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-2) var(--space-3);
    font: inherit;
    color: var(--color-text);
  }
  .steps {
    list-style: none;
    padding: 0;
    margin: 0 0 var(--space-3);
    display: grid;
    gap: var(--space-2);
  }
  .steps li {
    display: grid;
    grid-template-columns: 1fr 5rem auto auto;
    gap: var(--space-2);
    align-items: center;
  }
  .remove {
    width: 2rem;
    height: 2rem;
    border-radius: var(--radius-md);
    background: var(--color-bg);
    color: var(--color-text-muted);
  }
  .remove:hover {
    color: var(--color-danger);
  }
  .row-actions {
    display: flex;
    gap: var(--space-2);
    justify-content: space-between;
  }
  .section {
    margin-top: var(--space-8);
  }
  .section h2 {
    margin-bottom: var(--space-3);
    font-size: var(--text-xl);
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
    gap: var(--space-3);
  }
  .timer-wrap {
    display: grid;
    gap: var(--space-2);
  }
  .delete {
    justify-self: end;
    background: transparent;
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }
  .delete:hover {
    color: var(--color-danger);
  }
  .history {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: var(--space-1);
  }
  .history li {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: var(--space-3);
    padding: var(--space-2);
    border-bottom: 1px solid var(--color-border);
    align-items: center;
  }
  .status {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    text-transform: capitalize;
  }
  .history button {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }
</style>
