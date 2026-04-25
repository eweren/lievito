<script lang="ts">
  interface Props {
    variant?: 'primary' | 'ghost' | 'danger';
    type?: 'button' | 'submit' | 'reset';
    href?: string;
    disabled?: boolean;
    onclick?: (e: MouseEvent) => void;
    children: import('svelte').Snippet;
  }
  let { variant = 'primary', type = 'button', href, disabled, onclick, children }: Props = $props();
</script>

{#if href}
  <a class="btn" data-variant={variant} {href} aria-disabled={disabled || undefined}>
    {@render children()}
  </a>
{:else}
  <button class="btn" data-variant={variant} {type} {disabled} {onclick}>
    {@render children()}
  </button>
{/if}

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-md);
    font-family: var(--font-body);
    font-size: var(--text-sm);
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition:
      background-color var(--duration-fast) var(--ease-standard),
      transform var(--duration-fast) var(--ease-standard);
    min-height: 2.25rem;
  }
  .btn:active:not([disabled]) {
    transform: translateY(1px);
  }
  .btn[disabled] {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .btn[data-variant='primary'] {
    background: var(--color-accent);
    color: var(--color-pergamena);
  }
  .btn[data-variant='primary']:hover:not([disabled]) {
    background: var(--color-accent-hover);
  }
  .btn[data-variant='ghost'] {
    background: transparent;
    color: var(--color-text);
    border: 1px solid var(--color-border);
  }
  .btn[data-variant='ghost']:hover:not([disabled]) {
    background: var(--color-surface);
  }
  .btn[data-variant='danger'] {
    background: var(--color-danger);
    color: var(--color-pergamena);
  }
</style>
