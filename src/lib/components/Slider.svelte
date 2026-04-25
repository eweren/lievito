<script lang="ts">
  // Slider mit numerischem Input gekoppelt. Wert über bind:value
  // gebunden – getter/setter via Svelte 5 `$bindable`.

  interface Props {
    label: string;
    min: number;
    max: number;
    step?: number;
    value: number;
    suffix?: string;
    description?: string;
    /** Anzeigeformat: identische Faktor-Manipulation für Prozent-Slider. */
    displayMultiplier?: number;
    displayDigits?: number;
  }

  let {
    label,
    min,
    max,
    step = 1,
    value = $bindable(),
    suffix = '',
    description,
    displayMultiplier = 1,
    displayDigits = 0
  }: Props = $props();

  const id = $props.id();

  const display = $derived((value * displayMultiplier).toFixed(displayDigits));
</script>

<div class="slider-row">
  <label for={id}>{label}</label>
  <div class="slider-controls">
    <input
      type="range"
      {id}
      {min}
      {max}
      {step}
      bind:value
      aria-valuetext="{display}{suffix}"
      aria-describedby={description ? `${id}-desc` : undefined}
    />
    <output for={id} class="value">{display}<span class="suffix">{suffix}</span></output>
  </div>
  {#if description}
    <p id="{id}-desc" class="description">{description}</p>
  {/if}
</div>

<style>
  .slider-row {
    display: grid;
    gap: var(--space-1);
    padding-block: var(--space-2);
  }
  label {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    font-weight: 500;
  }
  .slider-controls {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: var(--space-3);
    align-items: center;
  }
  input[type='range'] {
    width: 100%;
    accent-color: var(--color-accent);
  }
  .value {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-variant-numeric: tabular-nums;
    color: var(--color-text);
    min-width: 4ch;
    text-align: right;
  }
  .suffix {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    margin-left: 0.15ch;
  }
  .description {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }
</style>
