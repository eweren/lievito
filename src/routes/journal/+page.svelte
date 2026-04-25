<script lang="ts">
  import { onMount } from 'svelte';
  import Button from '$lib/components/Button.svelte';
  import Card from '$lib/components/Card.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import { listBakes } from '$lib/db/bakes';
  import { estimateStorage, formatBytes, type StorageInfo } from '$lib/db/storage';
  import { browser } from '$app/environment';
  import type { BakeJournalEntry } from '$lib/types/schema';

  let bakes = $state<BakeJournalEntry[]>([]);
  let loading = $state(true);
  let storage = $state<StorageInfo | null>(null);

  onMount(async () => {
    if (!browser) return;
    bakes = await listBakes();
    storage = await estimateStorage();
    loading = false;
  });

  function formatDate(ts: number): string {
    return new Intl.DateTimeFormat('de-DE', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(ts));
  }

  const storageWarning = $derived(storage && storage.percent >= 0.8);
</script>

<svelte:head>
  <title>Backjournal – Lievito</title>
</svelte:head>

<div class="container">
  <header class="page-header">
    <p class="kicker">Phase 2 · Secondo</p>
    <div class="title-row">
      <h1>Backjournal</h1>
      <Button href="/journal/neu">Neuer Eintrag</Button>
    </div>
    <p class="lead">Jeder Bake, lokal auf deinem Gerät. Mit Foto, Bewertung, Notizen.</p>
  </header>

  {#if storage}
    <p class="storage" class:warn={storageWarning}>
      {#if storageWarning}⚠ Speicher-Auslastung {Math.round(storage.percent * 100)}% –
        denk an einen Export.
      {:else}
        Speicher: {formatBytes(storage.usage)} / {formatBytes(storage.quota)}
        ({Math.round(storage.percent * 1000) / 10} %)
        {storage.persisted ? ' · persistent' : ' · nicht persistent'}
      {/if}
    </p>
  {/if}

  {#if loading}
    <p class="loading">Lade…</p>
  {:else if bakes.length === 0}
    <EmptyState
      title="Noch kein Eintrag"
      description="Halte deinen nächsten Bake fest – Belag, Bewertung, Foto. Lokal, ohne Account."
    >
      <Button href="/journal/neu">Ersten Bake anlegen</Button>
    </EmptyState>
  {:else}
    <div class="grid">
      {#each bakes as bake (bake.id)}
        <a href="/journal/{bake.id}" class="bake-link">
          <Card>
            <header class="bake-head">
              <span class="rating" aria-label="{bake.rating} von 5 Sternen">
                {'★'.repeat(bake.rating)}{'☆'.repeat(5 - bake.rating)}
              </span>
              <time>{formatDate(bake.bakedAt)}</time>
            </header>
            {#if bake.notes}<p class="notes">{bake.notes}</p>{/if}
            <p class="meta">
              {bake.ovenType}
              {#if bake.ovenTemp}· {bake.ovenTemp} °C{/if}
              {#if bake.tags.length}· {bake.tags.join(', ')}{/if}
            </p>
          </Card>
        </a>
      {/each}
    </div>
  {/if}

  <p class="hint">
    <a href="/journal/export">Backjournal exportieren / importieren →</a>
  </p>
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
  .title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    margin-top: var(--space-2);
    flex-wrap: wrap;
  }
  .lead {
    color: var(--color-text-muted);
    margin-top: var(--space-2);
  }
  .storage {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin-bottom: var(--space-4);
  }
  .storage.warn {
    color: var(--color-warning);
    font-weight: 500;
  }
  .grid {
    display: grid;
    gap: var(--space-3);
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
  }
  .bake-link {
    text-decoration: none;
    color: inherit;
    display: block;
  }
  .bake-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: var(--space-2);
  }
  .rating {
    color: var(--color-accent);
    letter-spacing: 0.1em;
  }
  time {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }
  .notes {
    margin: var(--space-1) 0 var(--space-2);
    color: var(--color-text);
  }
  .meta {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }
  .loading {
    color: var(--color-text-muted);
  }
  .hint {
    margin-top: var(--space-8);
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }
</style>
