<script lang="ts">
  import RecipeCard from '$lib/components/RecipeCard.svelte';
  import { RECIPES } from '$lib/recipes';
  import { favorites } from '$lib/state/favorites.svelte';

  const favList = $derived(RECIPES.filter((r) => favorites.recipeSlugs.includes(r.slug)));
</script>

<svelte:head>
  <title>Rezepte – Lievito</title>
  <meta
    name="description"
    content="Kuratierte Pizzateig-Rezepte: Neapoletana, Romana, New York. Mit Werten, Ablauf und Fehlerdiagnose."
  />
</svelte:head>

<div class="container">
  <header class="page-header">
    <p class="kicker">Rezepte</p>
    <h1>Rezepte</h1>
    <p class="lead">
      Wenige Rezepte, dafür mit ehrlichen Begründungen. Jedes ist getestet, jedes erklärt das „Warum“.
    </p>
  </header>

  {#if favList.length}
    <section class="section">
      <h2 class="section-title">Gemerkte Rezepte</h2>
      <div class="grid">
        {#each favList as recipe (recipe.slug)}
          <RecipeCard {recipe} />
        {/each}
      </div>
    </section>
  {/if}

  <section class="section">
    {#if favList.length}<h2 class="section-title">Alle Rezepte</h2>{/if}
    <div class="grid">
      {#each RECIPES as recipe (recipe.slug)}
        <RecipeCard {recipe} />
      {/each}
    </div>
  </section>
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
    max-width: 60ch;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
    gap: var(--space-4);
  }
  .section + .section {
    margin-top: var(--space-8);
  }
  .section-title {
    margin-bottom: var(--space-4);
    font-size: var(--text-xl);
    color: var(--color-text-muted);
  }
</style>
