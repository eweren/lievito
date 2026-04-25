<script lang="ts">
  import RecipeCard from '$lib/components/RecipeCard.svelte';
  import { RECIPES } from '$lib/recipes';
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

  <div class="grid">
    {#each RECIPES as recipe (recipe.slug)}
      <RecipeCard {recipe} />
    {/each}
  </div>
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
</style>
