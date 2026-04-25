<script lang="ts">
  import { CATEGORIES, FLOURS, type FlourCategory } from '$lib/flour/data';

  let query = $state('');
  let activeCategory = $state<FlourCategory | 'alle'>('alle');

  const filtered = $derived(
    FLOURS.filter((f) => {
      if (activeCategory !== 'alle' && f.category !== activeCategory) return false;
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.bestFor.join(' ').toLowerCase().includes(q)
      );
    })
  );
</script>

<svelte:head>
  <title>Mehl-Lexikon – Lievito</title>
  <meta
    name="description"
    content="Pizzateig-Mehl-Lexikon: Tipo 00, Tipo 1, Manitoba, Pinsa-Mischung, Vollkorn und mehr. Mit Eiweißgehalt, W-Wert und passender Anwendung."
  />
</svelte:head>

<div class="container">
  <header class="page-header">
    <p class="kicker">Phase 3 · Contorno</p>
    <h1>Mehl-Lexikon</h1>
    <p class="lead">
      Welches Mehl für welchen Teig. Mit ehrlichen Hinweisen, wo eine Sorte nicht
      hinpasst.
    </p>
  </header>

  <div class="controls">
    <input type="search" placeholder="Suchen…" bind:value={query} aria-label="Mehl suchen" />
    <div class="categories" role="tablist" aria-label="Kategorien">
      <button
        type="button"
        role="tab"
        aria-selected={activeCategory === 'alle'}
        class:active={activeCategory === 'alle'}
        onclick={() => (activeCategory = 'alle')}
      >
        Alle ({FLOURS.length})
      </button>
      {#each CATEGORIES as cat (cat.id)}
        {@const count = FLOURS.filter((f) => f.category === cat.id).length}
        <button
          type="button"
          role="tab"
          aria-selected={activeCategory === cat.id}
          class:active={activeCategory === cat.id}
          onclick={() => (activeCategory = cat.id)}
        >
          {cat.label} ({count})
        </button>
      {/each}
    </div>
  </div>

  {#if filtered.length === 0}
    <p class="empty">Kein Mehl passt zur Suche.</p>
  {/if}

  <ul class="list">
    {#each filtered as flour (flour.id)}
      <li class="card">
        <header>
          <h2>{flour.name}</h2>
          <p class="meta">
            {flour.origin} · Eiweiß {flour.proteinPercent[0]}–{flour.proteinPercent[1]} %
            {#if flour.wValue}· W {flour.wValue[0]}–{flour.wValue[1]}{/if}
            {#if flour.pToL}· P/L {flour.pToL[0]}–{flour.pToL[1]}{/if}
          </p>
        </header>
        <p>{flour.description}</p>
        <dl class="ranges">
          {#if flour.hydrationRange[1] > 0}
            <div>
              <dt>Hydration</dt>
              <dd>{(flour.hydrationRange[0] * 100).toFixed(0)}–{(flour.hydrationRange[1] * 100).toFixed(0)} %</dd>
            </div>
          {/if}
          {#if flour.maturationRange[1] > 0}
            <div>
              <dt>Maturazione</dt>
              <dd>{flour.maturationRange[0]}–{flour.maturationRange[1]} h</dd>
            </div>
          {/if}
        </dl>
        <div class="usage">
          <h3>Geeignet für</h3>
          <ul>
            {#each flour.bestFor as use (use)}<li>{use}</li>{/each}
          </ul>
          {#if flour.notSuitable?.length}
            <h3 class="warn">Nicht geeignet für</h3>
            <ul class="not-suitable">
              {#each flour.notSuitable as use (use)}<li>{use}</li>{/each}
            </ul>
          {/if}
        </div>
      </li>
    {/each}
  </ul>
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
  .controls {
    display: grid;
    gap: var(--space-3);
    margin-bottom: var(--space-6);
  }
  input[type='search'] {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-2) var(--space-3);
    font: inherit;
    color: var(--color-text);
  }
  .categories {
    display: flex;
    gap: var(--space-1);
    flex-wrap: wrap;
  }
  .categories button {
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-pill);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }
  .categories button.active {
    background: var(--color-accent);
    color: var(--color-pergamena);
    border-color: var(--color-accent);
  }
  .empty {
    color: var(--color-text-muted);
    font-style: italic;
  }
  .list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
    gap: var(--space-4);
  }
  .card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-5);
    display: grid;
    gap: var(--space-3);
  }
  h2 {
    font-size: var(--text-lg);
  }
  .meta {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .ranges {
    display: flex;
    gap: var(--space-4);
    flex-wrap: wrap;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
  }
  .ranges dt {
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .ranges dd {
    margin: 0;
  }
  .usage h3 {
    font-size: var(--text-sm);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-muted);
    margin-bottom: var(--space-1);
  }
  .usage ul {
    margin: 0 0 var(--space-3);
    padding-left: 1.25rem;
  }
  .warn {
    color: var(--color-warning);
  }
  .not-suitable {
    color: var(--color-text-muted);
  }
</style>
