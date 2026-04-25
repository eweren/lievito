<script lang="ts">
  interface Props {
    title?: string;
    subtitle?: string;
    tone?: 'default' | 'accent' | 'muted';
    children: import('svelte').Snippet;
  }
  let { title, subtitle, tone = 'default', children }: Props = $props();
</script>

<section class="card" data-tone={tone}>
  {#if title}
    <header>
      <h2>{title}</h2>
      {#if subtitle}<p class="subtitle">{subtitle}</p>{/if}
    </header>
  {/if}
  {@render children()}
</section>

<style>
  .card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-5);
    box-shadow: var(--shadow-sm);
  }
  .card[data-tone='accent'] {
    border-color: color-mix(in oklch, var(--color-accent), transparent 65%);
    background: color-mix(in oklch, var(--color-accent), var(--color-surface) 90%);
  }
  .card[data-tone='muted'] {
    background: color-mix(in oklch, var(--color-bg), var(--color-surface) 50%);
  }
  header {
    margin-bottom: var(--space-3);
  }
  h2 {
    margin: 0;
    font-size: var(--text-xl);
  }
  .subtitle {
    margin-top: var(--space-1);
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }
</style>
