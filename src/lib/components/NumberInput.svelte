<script lang="ts">
  interface Props {
    label: string;
    value: number;
    min?: number;
    max?: number;
    step?: number;
    suffix?: string;
  }

  let { label, value = $bindable(), min, max, step = 1, suffix }: Props = $props();
  const id = $props.id();

  function decrement() {
    const next = value - step;
    if (min !== undefined && next < min) return;
    value = next;
  }

  function increment() {
    const next = value + step;
    if (max !== undefined && next > max) return;
    value = next;
  }
</script>

<div class="number-input">
  <label for={id}>{label}</label>
  <div class="control">
    <button type="button" onclick={decrement} aria-label="Verringern">−</button>
    <input type="number" {id} {min} {max} {step} bind:value />
    {#if suffix}<span class="suffix">{suffix}</span>{/if}
    <button type="button" onclick={increment} aria-label="Erhöhen">+</button>
  </div>
</div>

<style>
  .number-input {
    display: grid;
    gap: var(--space-1);
  }
  label {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    font-weight: 500;
  }
  .control {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    padding: var(--space-1) var(--space-2);
  }
  input {
    flex: 1;
    background: transparent;
    border: 0;
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
    text-align: center;
    min-width: 0;
  }
  input:focus {
    outline: 0;
  }
  .control:focus-within {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }
  button {
    width: 1.75rem;
    height: 1.75rem;
    border-radius: var(--radius-md);
    background: color-mix(in oklch, var(--color-bg), transparent 30%);
    color: var(--color-text);
    font-size: var(--text-lg);
    line-height: 1;
  }
  button:hover {
    background: var(--color-bg);
  }
  .suffix {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }
</style>
