<script lang="ts">
  interface Props {
    title: string;
    description?: string;
    icon?: string;
    children?: import('svelte').Snippet;
  }
  let { title, description, icon = '🍕', children }: Props = $props();
</script>

<div class="empty">
  <div class="icon" aria-hidden="true">{icon}</div>
  <h3>{title}</h3>
  {#if description}<p>{description}</p>{/if}
  {#if children}<div class="actions">{@render children()}</div>{/if}
</div>

<style>
  .empty {
    text-align: center;
    padding: var(--space-12) var(--space-4);
    border: 2px dashed var(--color-border);
    border-radius: var(--radius-lg);
    color: var(--color-text-muted);
  }
  .icon {
    font-size: var(--text-4xl);
    margin-bottom: var(--space-3);
  }
  h3 {
    margin-bottom: var(--space-2);
    color: var(--color-text);
  }
  p {
    max-width: 36rem;
    margin-inline: auto;
  }
  .actions {
    margin-top: var(--space-6);
    display: flex;
    gap: var(--space-3);
    justify-content: center;
    flex-wrap: wrap;
  }
</style>
