<script lang="ts">
  interface Tab<T extends string> {
    id: T;
    label: string;
  }

  type Props<T extends string> = {
    tabs: Tab<T>[];
    selected: T;
    onselect: (id: T) => void;
    label?: string;
  };

  let { tabs, selected, onselect, label = 'Tabs' }: Props<string> = $props();
</script>

<div role="tablist" aria-label={label} class="tabs">
  {#each tabs as tab (tab.id)}
    <button
      type="button"
      role="tab"
      aria-selected={tab.id === selected}
      tabindex={tab.id === selected ? 0 : -1}
      class:selected={tab.id === selected}
      onclick={() => onselect(tab.id)}
    >
      {tab.label}
    </button>
  {/each}
</div>

<style>
  .tabs {
    display: inline-flex;
    gap: var(--space-1);
    background: var(--color-surface);
    padding: var(--space-1);
    border-radius: var(--radius-pill);
    border: 1px solid var(--color-border);
  }
  button {
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-pill);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    transition: background-color var(--duration-fast) var(--ease-standard);
  }
  button:hover {
    color: var(--color-text);
  }
  button.selected {
    background: var(--color-bg);
    color: var(--color-text);
    box-shadow: var(--shadow-sm);
  }
</style>
