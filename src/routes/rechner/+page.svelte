<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import Card from '$lib/components/Card.svelte';
  import Slider from '$lib/components/Slider.svelte';
  import NumberInput from '$lib/components/NumberInput.svelte';
  import Button from '$lib/components/Button.svelte';
  import Tabs from '$lib/components/Tabs.svelte';
  import { STYLE_LIST, getStyle } from '$lib/dough/styles';
  import { suggestYeastPercent } from '$lib/dough/calculate';
  import {
    calculator,
    calculatorUrlConfig,
    defaultInput,
    isDefaultInput
  } from '$lib/state/calculator.svelte';
  import {
    readInitialFromUrl,
    writeStateToUrl
  } from '$lib/state/url-state.svelte';
  import { saveLastCalculation, loadLastCalculation } from '$lib/state/favorites.svelte';
  import { page } from '$app/state';
  import type { DoughStyle } from '$lib/types/schema';

  // Initial-State: URL hat Vorrang. Wenn die URL leer ist, lade den
  // zuletzt genutzten Setup aus localStorage (sofern vorhanden).
  onMount(() => {
    if (page.url.search.length > 0) {
      calculator.input = readInitialFromUrl(calculatorUrlConfig);
    } else {
      const last = loadLastCalculation();
      if (last) calculator.input = last;
    }
  });

  // URL-Schreib-Effect + persistenter Last-Setup.
  $effect(() => {
    if (!browser) return;
    writeStateToUrl(calculator.input, calculatorUrlConfig);
    if (!isDefaultInput(calculator.input)) saveLastCalculation(calculator.input);
  });

  // Hefe folgt automatisch aus Hefeart, Gesamt-Maturazione und Reife-Temperatur.
  // Manuelles Drehen am Slider bleibt bis zur nächsten Änderung dieser drei Werte erhalten.
  $effect(() => {
    const hours = calculator.input.maturationHours;
    const temp = calculator.input.maturationTemp;
    const yeastType = calculator.input.yeastType;
    calculator.input.yeastPercent = suggestYeastPercent({ hours, temp, yeastType });
  });

  const tabList = $derived(STYLE_LIST.map((s) => ({ id: s.id, label: s.label })));
  const profile = $derived(getStyle(calculator.input.style));

  const ranges = $derived(profile.ranges);

  function selectStyle(id: string) {
    calculator.setStyle(id as DoughStyle);
  }

async function shareUrl() {
    if (!browser) return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Lievito-Rechner', url });
        return;
      } catch {
        /* fall through */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      copied = true;
      setTimeout(() => (copied = false), 1500);
    } catch {
      /* ignore */
    }
  }

  let copied = $state(false);

  function fmt(n: number, digits = 0) {
    return n.toLocaleString('de-DE', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    });
  }
</script>

<svelte:head>
  <title>Direktteig-Rechner – Lievito</title>
  <meta
    name="description"
    content="Pizzateig-Rechner für Neapoletana, Romana, NY und Pan/Detroit. Idratazione, Salz, Hefe, Maturazione – alle Werte teilbar via URL."
  />
  <meta property="og:title" content="Direktteig-Rechner · Lievito" />
  <meta property="og:description" content="Pizzateig in Bäckerprozent, sofort teilbar via URL." />
  <meta
    property="og:image"
    content="/api/og?title=Direktteig-Rechner&badge=Rechner&subtitle=Pizzateig%20in%20B%C3%A4ckerprozent"
  />
  <meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<div class="container">
  <header class="page-header">
    <p class="kicker">Phase 1 · Primo</p>
    <h1>Direktteig-Rechner</h1>
    <p class="lead">
      Pizzateig in Bäckerprozent. Schiebe die Regler, sieh die Mengen sofort, teile die URL mit
      Pizza-Kollegen.
    </p>
  </header>

  <div class="style-tabs">
    <Tabs tabs={tabList} selected={calculator.input.style} onselect={selectStyle} label="Pizzastil" />
  </div>

  <p class="style-description">{profile.description}</p>

  <div class="grid">
    <div class="inputs">
      <Card title="Format">
        <div class="number-row">
          <NumberInput
            label="Pizzen"
            bind:value={calculator.input.pizzaCount}
            min={1}
            max={20}
          />
          <NumberInput
            label="Ballgewicht"
            bind:value={calculator.input.ballWeight}
            min={ranges.ballWeight[0]}
            max={ranges.ballWeight[1]}
            step={10}
            suffix="g"
          />
        </div>
      </Card>

      <Card title="Teig">
        <Slider
          label="Idratazione"
          min={ranges.hydration[0]}
          max={ranges.hydration[1]}
          step={0.005}
          bind:value={calculator.input.hydration}
          suffix="%"
          displayMultiplier={100}
          displayDigits={1}
          description="Wasseranteil in Prozent vom Mehlgewicht."
        />
        <Slider
          label="Salz"
          min={ranges.saltPercent[0]}
          max={ranges.saltPercent[1]}
          step={0.05}
          bind:value={calculator.input.saltPercent}
          suffix="%"
          displayDigits={2}
          description="Bäckerprozent auf Mehl. AVPN: 2.8 – 3.0 %."
        />
        {#if profile.hasOil}
          <Slider
            label="Olivenöl"
            min={0}
            max={6}
            step={0.5}
            bind:value={calculator.input.oilPercent as unknown as number}
            suffix="%"
            displayDigits={1}
          />
        {/if}
        {#if profile.hasSugar}
          <Slider
            label="Zucker"
            min={0}
            max={3}
            step={0.1}
            bind:value={calculator.input.sugarPercent as unknown as number}
            suffix="%"
            displayDigits={1}
          />
        {/if}
      </Card>

      <Card title="Hefe & Reife">
        <div class="select-row">
          <label class="select-label">
            <span>Hefe</span>
            <select bind:value={calculator.input.yeastType}>
              <option value="fresh">Frischhefe</option>
              <option value="dry">Trockenhefe</option>
              <option value="lievito-madre">Lievito Madre</option>
            </select>
          </label>
          <label class="select-label">
            <span>Mehl</span>
            <select bind:value={calculator.input.flourType}>
              <option value="tipo00">Tipo 00</option>
              <option value="tipo1">Tipo 1</option>
              <option value="tipo2">Tipo 2</option>
              <option value="vollkorn">Vollkorn</option>
            </select>
          </label>
        </div>

        <Slider
          label="Hefemenge"
          min={ranges.yeastPercent[0]}
          max={ranges.yeastPercent[1]}
          step={0.005}
          bind:value={calculator.input.yeastPercent}
          suffix="%"
          displayDigits={3}
        />
        <p class="hint">
          Wird automatisch aus Hefeart, Maturazione und Reife-Temperatur berechnet. Slider erlaubt
          Feinjustierung bis zur nächsten Änderung.
        </p>

        <Slider
          label="Maturazione"
          min={ranges.maturationHours[0]}
          max={ranges.maturationHours[1]}
          step={1}
          bind:value={calculator.input.maturationHours}
          suffix=" h"
        />
        <Slider
          label="Reife-Temperatur"
          min={ranges.maturationTemp[0]}
          max={ranges.maturationTemp[1]}
          step={1}
          bind:value={calculator.input.maturationTemp}
          suffix=" °C"
        />
      </Card>

      <Card title="Vorteig">
        <label class="select-label">
          <span>Methode</span>
          <select bind:value={calculator.input.preFerment}>
            <option value="none">Direktteig (kein Vorteig)</option>
            <option value="poolish">Poolish</option>
            <option value="biga">Biga</option>
            <option value="lievito-madre">Lievito Madre</option>
          </select>
        </label>
        {#if calculator.input.preFerment !== 'none'}
          <Slider
            label="Vorteig-Anteil"
            min={0.1}
            max={0.7}
            step={0.05}
            bind:value={calculator.input.preFermentRatio as unknown as number}
            suffix="%"
            displayMultiplier={100}
            displayDigits={0}
            description="Anteil des Vorteig-Mehls am Gesamtmehl."
          />
        {/if}
      </Card>

      <div class="actions">
        <Button variant="ghost" onclick={() => (calculator.input = defaultInput(calculator.input.style))}
          >Zurücksetzen</Button
        >
        <Button onclick={shareUrl}>{copied ? 'URL kopiert' : 'Teilen'}</Button>
      </div>
    </div>

    <div class="results">
      <Card title="Hauptteig" tone="accent">
        <dl class="amounts">
          <div><dt>Mehl</dt><dd>{fmt(calculator.result.flour)} g</dd></div>
          <div><dt>Wasser</dt><dd>{fmt(calculator.result.water)} g</dd></div>
          <div><dt>Salz</dt><dd>{fmt(calculator.result.salt, 1)} g</dd></div>
          <div><dt>Hefe</dt><dd>{fmt(calculator.result.yeast, 2)} g</dd></div>
          {#if calculator.result.oil != null}
            <div><dt>Olivenöl</dt><dd>{fmt(calculator.result.oil, 1)} g</dd></div>
          {/if}
          {#if calculator.result.sugar != null}
            <div><dt>Zucker</dt><dd>{fmt(calculator.result.sugar, 1)} g</dd></div>
          {/if}
          <div class="total"><dt>Gesamt</dt><dd>{fmt(calculator.result.totalDough)} g</dd></div>
        </dl>
      </Card>

      {#if calculator.result.preFerment}
        <Card title="Vorteig ({calculator.result.preFerment.type})" tone="muted">
          <dl class="amounts">
            <div><dt>Mehl</dt><dd>{fmt(calculator.result.preFerment.flour)} g</dd></div>
            <div><dt>Wasser</dt><dd>{fmt(calculator.result.preFerment.water)} g</dd></div>
            <div><dt>Hefe</dt><dd>{fmt(calculator.result.preFerment.yeast, 3)} g</dd></div>
            <div class="total"><dt>Vorteig gesamt</dt><dd>{fmt(calculator.result.preFerment.totalWeight)} g</dd></div>
          </dl>
          <p class="note">
            Reifezeit Vorteig: ca. {calculator.result.preFerment.restHours} h bei {calculator.result.preFerment.restTemp} °C.
          </p>
        </Card>
      {/if}

      {#if calculator.result.mainDough}
        <Card title="Zugabe in den Hauptteig" tone="muted">
          <dl class="amounts">
            <div><dt>Mehl</dt><dd>{fmt(calculator.result.mainDough.flour)} g</dd></div>
            <div><dt>Wasser</dt><dd>{fmt(calculator.result.mainDough.water)} g</dd></div>
            <div><dt>Salz</dt><dd>{fmt(calculator.result.mainDough.salt, 1)} g</dd></div>
            <div><dt>Hefe</dt><dd>{fmt(calculator.result.mainDough.yeast, 3)} g</dd></div>
          </dl>
        </Card>
      {/if}

      <Card title="Ablauf" tone="muted">
        <ol class="schedule">
          <li>
            <strong>Stockgare:</strong>
            {calculator.result.bulkFermentation.hours} h bei {calculator.result.bulkFermentation.temp} °C
          </li>
          {#if calculator.result.coldRetard}
            <li>
              <strong>Kühlschrank-Reife:</strong>
              {calculator.result.coldRetard.hours} h bei {calculator.result.coldRetard.temp} °C
            </li>
          {/if}
          <li>
            <strong>Stückgare:</strong>
            {calculator.result.ballingTime.hours} h bei {calculator.result.ballingTime.temp} °C
          </li>
        </ol>
      </Card>

      {#if calculator.result.warnings.length}
        <Card title="Hinweise" tone="muted">
          <ul class="warnings">
            {#each calculator.result.warnings as w (w)}
              <li>{w}</li>
            {/each}
          </ul>
        </Card>
      {/if}
    </div>
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
  .style-tabs {
    margin-bottom: var(--space-3);
    overflow-x: auto;
  }
  .style-description {
    color: var(--color-text-muted);
    margin-bottom: var(--space-6);
    max-width: 60ch;
    font-size: var(--text-sm);
  }
  .grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-6);
  }
  @media (min-width: 900px) {
    .grid {
      grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
      align-items: start;
    }
    .results {
      position: sticky;
      top: calc(var(--header-height) + var(--space-4));
    }
  }
  .inputs,
  .results {
    display: grid;
    gap: var(--space-4);
  }
  .number-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3);
  }
  .select-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3);
    margin-bottom: var(--space-3);
  }
  .select-label {
    display: grid;
    gap: var(--space-1);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }
  .select-label select {
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-2) var(--space-3);
    font: inherit;
    color: var(--color-text);
  }
  .hint {
    margin: -0.25rem 0 var(--space-2);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }
  .actions {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .amounts {
    display: grid;
    gap: var(--space-2);
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
  }
  .amounts > div {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px dashed var(--color-border);
    padding-block: var(--space-1);
  }
  .amounts dt {
    color: var(--color-text-muted);
    font-family: var(--font-body);
  }
  .amounts dd {
    margin: 0;
    font-weight: 500;
  }
  .amounts .total {
    border-bottom: 0;
    padding-top: var(--space-2);
    border-top: 1px solid var(--color-border);
    font-weight: 700;
  }
  .schedule {
    margin: 0;
    padding-left: 1.25rem;
    color: var(--color-text-muted);
  }
  .schedule li {
    margin-block: var(--space-1);
  }
  .schedule strong {
    color: var(--color-text);
  }
  .warnings {
    margin: 0;
    padding-left: 1.25rem;
    color: var(--color-warning);
  }
  .note {
    margin-top: var(--space-3);
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }
</style>
