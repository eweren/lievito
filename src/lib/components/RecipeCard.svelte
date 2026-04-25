<script lang="ts">
  import type { Recipe } from '$lib/recipes';

  interface Props {
    recipe: Recipe;
  }
  let { recipe }: Props = $props();

  const STYLE_LABELS: Record<Recipe['style'], string> = {
    neapoletana: 'Neapoletana',
    romana: 'Romana',
    ny: 'New York',
    pan: 'Pan/Detroit'
  };

  const DIFFICULTY_LABELS: Record<Recipe['difficulty'], string> = {
    einsteiger: 'Einsteiger',
    fortgeschritten: 'Fortgeschritten',
    profi: 'Profi'
  };
</script>

<a class="recipe-card" href="/rezepte/{recipe.slug}">
  <header>
    <p class="meta">
      <span>{STYLE_LABELS[recipe.style]}</span>
      <span aria-hidden="true">·</span>
      <span>{recipe.maturationHours} h</span>
      <span aria-hidden="true">·</span>
      <span>{DIFFICULTY_LABELS[recipe.difficulty]}</span>
    </p>
    <h3>{recipe.title}</h3>
  </header>
  <p class="excerpt">{recipe.excerpt}</p>
</a>

<style>
  .recipe-card {
    display: grid;
    gap: var(--space-3);
    padding: var(--space-5);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    color: var(--color-text);
    text-decoration: none;
    transition:
      transform var(--duration-fast) var(--ease-standard),
      border-color var(--duration-fast) var(--ease-standard),
      box-shadow var(--duration-fast) var(--ease-standard);
  }
  .recipe-card:hover {
    border-color: var(--color-accent);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  .meta {
    color: var(--color-text-muted);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }
  h3 {
    margin-top: var(--space-1);
  }
  .excerpt {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }
</style>
