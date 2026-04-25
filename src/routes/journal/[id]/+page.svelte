<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import Button from '$lib/components/Button.svelte';
  import Card from '$lib/components/Card.svelte';
  import { getBake, getPhotosForBake, deleteBake } from '$lib/db/bakes';
  import type { BakeJournalEntry, PhotoEntry } from '$lib/types/schema';

  let bake = $state<BakeJournalEntry | null>(null);
  let photos = $state<PhotoEntry[]>([]);
  let notFound = $state(false);
  let confirmDelete = $state(false);

  onMount(async () => {
    const id = page.params.id;
    if (!id) {
      notFound = true;
      return;
    }
    const found = await getBake(id);
    if (!found) {
      notFound = true;
      return;
    }
    bake = found;
    photos = await getPhotosForBake(id);
  });

  function url(blob: Blob) {
    return URL.createObjectURL(blob);
  }

  async function remove() {
    if (!bake) return;
    await deleteBake(bake.id);
    goto('/journal');
  }

  function formatDate(ts: number) {
    return new Intl.DateTimeFormat('de-DE', { dateStyle: 'long', timeStyle: 'short' }).format(
      new Date(ts)
    );
  }
</script>

<div class="container">
  {#if notFound}
    <p>Eintrag nicht gefunden.</p>
    <Button href="/journal" variant="ghost">Zurück zum Backjournal</Button>
  {:else if bake}
    <header class="page-header">
      <p class="kicker">Backjournal</p>
      <p class="back"><a href="/journal">← Übersicht</a></p>
      <h1>{bake.notes ? bake.notes.split('\n')[0].slice(0, 60) : 'Bake-Eintrag'}</h1>
      <p class="meta">
        {formatDate(bake.bakedAt)} · {bake.ovenType}
        {#if bake.ovenTemp}· {bake.ovenTemp} °C{/if}
        {#if bake.bakingTimeSec}· {Math.round(bake.bakingTimeSec)} s{/if}
      </p>
      <p class="rating" aria-label="{bake.rating} von 5 Sternen">
        {'★'.repeat(bake.rating)}{'☆'.repeat(5 - bake.rating)}
      </p>
    </header>

    {#if photos.length}
      <Card>
        <ul class="gallery">
          {#each photos as photo (photo.id)}
            <li><img src={url(photo.blob)} alt="" loading="lazy" /></li>
          {/each}
        </ul>
      </Card>
    {/if}

    {#if bake.notes}
      <Card title="Notizen">
        <p style="white-space:pre-line">{bake.notes}</p>
      </Card>
    {/if}

    {#if bake.tags.length}
      <Card title="Tags">
        <ul class="tags">
          {#each bake.tags as tag (tag)}
            <li>{tag}</li>
          {/each}
        </ul>
      </Card>
    {/if}

    {#if bake.calculation}
      <Card title="Verwendete Werte">
        <dl>
          <div><dt>Stil</dt><dd>{bake.calculation.style}</dd></div>
          <div><dt>Idratazione</dt><dd>{(bake.calculation.hydration * 100).toFixed(1)} %</dd></div>
          <div><dt>Salz</dt><dd>{bake.calculation.saltPercent} %</dd></div>
          <div><dt>Hefe</dt><dd>{bake.calculation.yeastPercent} % {bake.calculation.yeastType}</dd></div>
          <div><dt>Maturazione</dt><dd>{bake.calculation.maturationHours} h bei {bake.calculation.maturationTemp} °C</dd></div>
        </dl>
      </Card>
    {/if}

    <div class="actions">
      <Button variant="ghost" href="/journal">Zurück</Button>
      {#if confirmDelete}
        <Button variant="danger" onclick={remove}>Wirklich löschen</Button>
        <Button variant="ghost" onclick={() => (confirmDelete = false)}>Abbrechen</Button>
      {:else}
        <Button variant="danger" onclick={() => (confirmDelete = true)}>Eintrag löschen</Button>
      {/if}
    </div>
  {:else}
    <p>Lade…</p>
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
  .back {
    margin-block: var(--space-2);
    font-size: var(--text-sm);
  }
  .back a {
    color: var(--color-text-muted);
    text-decoration: none;
  }
  .meta {
    color: var(--color-text-muted);
    margin-top: var(--space-2);
  }
  .rating {
    color: var(--color-accent);
    margin-top: var(--space-2);
    letter-spacing: 0.15em;
    font-size: var(--text-lg);
  }
  .gallery {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
    gap: var(--space-2);
  }
  .gallery img {
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: cover;
    border-radius: var(--radius-md);
  }
  .tags {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
  .tags li {
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-pill);
    padding: var(--space-1) var(--space-3);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }
  dl {
    display: grid;
    gap: var(--space-2);
  }
  dl > div {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px dashed var(--color-border);
    padding-block: var(--space-1);
  }
  dt {
    color: var(--color-text-muted);
  }
  dd {
    margin: 0;
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
  }
  .actions {
    margin-top: var(--space-8);
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
  }
</style>
