<script lang="ts">
  import type { PageProps } from './$types';
  import { favorites } from '$lib/state/favorites.svelte';

  let { data }: PageProps = $props();
  const recipe = $derived(data.recipe);
  const isFavorite = $derived(favorites.has(recipe.slug));

  const STYLE_LABELS: Record<string, string> = {
    neapoletana: 'Neapoletana',
    romana: 'Romana',
    ny: 'New York',
    pan: 'Pan/Detroit'
  };

  function calculatorLink(): string {
    const params = new URLSearchParams();
    params.set('style', recipe.style);
    if (recipe.hydration) params.set('hydration', String(recipe.hydration));
    if (recipe.ballWeight) params.set('ballWeight', String(recipe.ballWeight));
    if (recipe.maturationHours) params.set('maturationHours', String(recipe.maturationHours));
    if (recipe.preFerment && recipe.preFerment !== 'none')
      params.set('preFerment', recipe.preFerment);
    return `/rechner?${params.toString()}`;
  }

  const ogImage = $derived(
    `/api/og?title=${encodeURIComponent(recipe.title)}&badge=${encodeURIComponent(STYLE_LABELS[recipe.style] ?? 'Pizza')}&subtitle=${encodeURIComponent(`${recipe.maturationHours} h Maturazione · ${recipe.difficulty}`)}`
  );

  // JSON-LD strukturierte Daten für SEO.
  const jsonLd = $derived({
    '@context': 'https://schema.org/',
    '@type': 'Recipe',
    name: recipe.title,
    description: recipe.excerpt,
    keywords: recipe.tags?.join(', '),
    recipeCategory: 'Pizza',
    recipeCuisine: 'italienisch',
    datePublished: recipe.publishedAt,
    totalTime: `PT${recipe.maturationHours}H`,
    recipeYield: recipe.ballWeight ? `${recipe.ballWeight} g pro Pizza` : undefined
  });
</script>

<svelte:head>
  <title>{recipe.title} – Lievito</title>
  <meta name="description" content={recipe.excerpt} />
  <meta property="og:title" content={recipe.title} />
  <meta property="og:description" content={recipe.excerpt} />
  <meta property="og:type" content="article" />
  <meta property="og:image" content={ogImage} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content={ogImage} />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}<\/script>`}
</svelte:head>

<article class="container article">
  <header class="article-header">
    <p class="meta">
      <a href="/rezepte" class="back">← Rezepte</a>
    </p>
    <p class="kicker">{STYLE_LABELS[recipe.style] ?? recipe.style}</p>
    <h1>{recipe.title}</h1>
    <p class="excerpt">{recipe.excerpt}</p>
    <dl class="quickfacts">
      <div><dt>Maturazione</dt><dd>{recipe.maturationHours} h</dd></div>
      {#if recipe.ballWeight}
        <div><dt>Ballgewicht</dt><dd>{recipe.ballWeight} g</dd></div>
      {/if}
      {#if recipe.hydration}
        <div><dt>Idratazione</dt><dd>{(recipe.hydration * 100).toFixed(0)} %</dd></div>
      {/if}
      <div><dt>Schwierigkeit</dt><dd>{recipe.difficulty}</dd></div>
    </dl>
    <p class="actions-row">
      <a class="cta" href={calculatorLink()}>Werte im Rechner öffnen →</a>
      <button
        class="fav"
        type="button"
        onclick={() => favorites.toggle(recipe.slug)}
        aria-pressed={isFavorite}
      >
        {isFavorite ? '★ Gemerkt' : '☆ Merken'}
      </button>
    </p>
  </header>

  <div class="prose">
    <recipe.component />
  </div>
</article>

<style>
  .article {
    max-width: 42rem;
  }
  .article-header {
    margin-bottom: var(--space-8);
  }
  .meta {
    margin-bottom: var(--space-2);
  }
  .back {
    color: var(--color-text-muted);
    text-decoration: none;
    font-size: var(--text-sm);
  }
  .kicker {
    color: var(--color-accent);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .excerpt {
    margin-top: var(--space-3);
    color: var(--color-text-muted);
    font-size: var(--text-lg);
  }
  .quickfacts {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
    margin-top: var(--space-6);
    padding: var(--space-4);
    background: var(--color-surface);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
  }
  .quickfacts > div {
    display: grid;
  }
  .quickfacts dt {
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-muted);
  }
  .quickfacts dd {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--text-base);
  }
  .cta {
    display: inline-block;
    margin-top: var(--space-6);
    padding: var(--space-2) var(--space-4);
    background: var(--color-accent);
    color: var(--color-pergamena);
    border-radius: var(--radius-md);
    text-decoration: none;
  }
  .cta:hover {
    background: var(--color-accent-hover);
    color: var(--color-pergamena);
  }
  .actions-row {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
    align-items: center;
    margin-top: var(--space-6);
  }
  .actions-row .cta {
    margin-top: 0;
  }
  .fav {
    padding: var(--space-2) var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text);
  }
  .fav:hover {
    background: var(--color-surface);
  }
  .fav[aria-pressed='true'] {
    color: var(--color-accent);
    border-color: var(--color-accent);
  }
  .prose {
    line-height: 1.7;
  }
  .prose :global(h2) {
    margin-top: var(--space-8);
    margin-bottom: var(--space-3);
    font-size: var(--text-xl);
  }
  .prose :global(p),
  .prose :global(ul),
  .prose :global(ol) {
    margin-block: var(--space-3);
  }
  .prose :global(li) {
    margin-block: var(--space-1);
  }
  .prose :global(strong) {
    color: var(--color-text);
  }
  .prose :global(code) {
    background: var(--color-surface);
    padding: 0.1em 0.4em;
    border-radius: var(--radius-sm);
  }
</style>
