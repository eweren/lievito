<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import Card from '$lib/components/Card.svelte';
  import {
    downloadExport,
    downloadZipExport,
    importBundle,
    readImportFile,
    readZipImportFile,
    type ImportMode,
    type ImportSummary
  } from '$lib/db/export';

  let mode = $state<ImportMode>('merge');
  let summary = $state<ImportSummary | null>(null);
  let error = $state<string | null>(null);
  let exportedFile = $state<string | null>(null);
  let busy = $state(false);

  async function onExport() {
    busy = true;
    error = null;
    try {
      exportedFile = await downloadExport();
    } catch (e) {
      error = (e as Error).message ?? 'Export fehlgeschlagen';
    } finally {
      busy = false;
    }
  }

  async function onZipExport() {
    busy = true;
    error = null;
    try {
      exportedFile = await downloadZipExport();
    } catch (e) {
      error = (e as Error).message ?? 'ZIP-Export fehlgeschlagen';
    } finally {
      busy = false;
    }
  }

  async function onImport(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    busy = true;
    error = null;
    summary = null;
    try {
      const bundle = file.name.toLowerCase().endsWith('.zip')
        ? await readZipImportFile(file)
        : await readImportFile(file);
      summary = await importBundle(bundle, mode);
    } catch (e) {
      error = (e as Error).message ?? 'Import fehlgeschlagen';
    } finally {
      busy = false;
      input.value = '';
    }
  }
</script>

<svelte:head>
  <title>Backjournal Export/Import – Lievito</title>
</svelte:head>

<div class="container narrow">
  <header class="page-header">
    <p class="kicker">Backjournal</p>
    <h1>Export &amp; Import</h1>
    <p class="lead">
      Dein Backjournal als JSON-Datei. Einmal pro Quartal exportieren ist eine gute
      Idee – iOS-Safari kann inaktive PWAs sonst gnadenlos räumen.
    </p>
  </header>

  <Card title="Exportieren">
    <p>
      Die Export-Datei enthält alle Bakes, Fotos (als Data-URL), Timer-Sessions,
      Chat-Verläufe und Einstellungen. Format-Version: 1.
    </p>
    <div class="actions">
      <Button onclick={onExport} disabled={busy}>JSON-Export</Button>
      <Button variant="ghost" onclick={onZipExport} disabled={busy}>
        ZIP-Export inkl. Fotos
      </Button>
    </div>
    {#if exportedFile}
      <p class="success">✓ {exportedFile} heruntergeladen.</p>
    {/if}
  </Card>

  <Card title="Importieren">
    <fieldset class="mode" disabled={busy}>
      <legend>Strategie</legend>
      <label>
        <input type="radio" name="mode" value="merge" bind:group={mode} />
        Hinzufügen <span class="hint">(IDs gleich → überspringen)</span>
      </label>
      <label>
        <input type="radio" name="mode" value="replace" bind:group={mode} />
        Ersetzen <span class="hint">(löscht alles vor dem Import!)</span>
      </label>
    </fieldset>

    <label class="upload">
      <input
        type="file"
        accept="application/json,.json,application/zip,.zip"
        onchange={onImport}
        disabled={busy}
      />
    </label>
    <p class="hint">JSON oder ZIP – Format wird automatisch erkannt.</p>

    {#if summary}
      <div class="summary success">
        ✓ Import abgeschlossen. {summary.bakesAdded} Bakes hinzugefügt
        ({summary.bakesSkipped} übersprungen), {summary.photosAdded} Fotos,
        {summary.timersAdded} Timer, {summary.chatsAdded} Chats.
      </div>
    {/if}
  </Card>

  {#if error}<p class="error">{error}</p>{/if}

  <p class="back"><a href="/journal">← Zurück zum Backjournal</a></p>
</div>

<style>
  .narrow {
    max-width: 38rem;
  }
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
  }
  .actions {
    margin-top: var(--space-3);
  }
  .success {
    color: var(--color-success);
    margin-top: var(--space-3);
  }
  .summary {
    margin-top: var(--space-3);
    padding: var(--space-3);
    background: color-mix(in oklch, var(--color-success), var(--color-surface) 80%);
    border-radius: var(--radius-md);
  }
  .error {
    color: var(--color-danger);
  }
  .mode {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-3);
    margin-bottom: var(--space-3);
    display: grid;
    gap: var(--space-2);
  }
  legend {
    padding-inline: var(--space-2);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }
  .mode label {
    display: flex;
    gap: var(--space-2);
    align-items: center;
  }
  .hint {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }
  .upload input {
    width: 100%;
  }
  .back {
    margin-top: var(--space-8);
    font-size: var(--text-sm);
  }
  .back a {
    color: var(--color-text-muted);
    text-decoration: none;
  }
</style>
