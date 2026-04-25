<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '$lib/components/Button.svelte';
  import Card from '$lib/components/Card.svelte';
  import { createBake } from '$lib/db/bakes';
  import { processImageFile } from '$lib/db/photos';
  import type { OvenType, PhotoEntry } from '$lib/types/schema';

  let bakedAt = $state(toDateInputValue(Date.now()));
  let rating = $state(4) as 1 | 2 | 3 | 4 | 5 | { value: 1 | 2 | 3 | 4 | 5 };
  let notes = $state('');
  let ovenType = $state<OvenType>('haushaltsofen');
  let ovenTemp = $state<number | undefined>(280);
  let bakingTimeSec = $state<number | undefined>(360);
  let tagsRaw = $state('');
  let pending = $state<PhotoEntry[]>([]);
  let saving = $state(false);
  let error = $state<string | null>(null);

  async function handleFiles(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    if (!input.files) return;
    error = null;
    try {
      for (const file of Array.from(input.files)) {
        const photo = await processImageFile(file, 'pending');
        pending = [...pending, photo];
      }
    } catch (e) {
      error = (e as Error).message ?? 'Foto konnte nicht verarbeitet werden';
    }
    input.value = '';
  }

  function removePhoto(id: string) {
    pending = pending.filter((p) => p.id !== id);
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    saving = true;
    error = null;
    try {
      const ratingNum = (typeof rating === 'number' ? rating : rating.value) as 1 | 2 | 3 | 4 | 5;
      const tags = tagsRaw
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const entry = await createBake(
        {
          bakedAt: new Date(bakedAt).getTime(),
          rating: ratingNum,
          notes,
          ovenType,
          ovenTemp,
          bakingTimeSec,
          tags
        },
        pending
      );
      goto(`/journal/${entry.id}`);
    } catch (e) {
      error = (e as Error).message ?? 'Speichern fehlgeschlagen';
      saving = false;
    }
  }

  function toDateInputValue(ts: number): string {
    const d = new Date(ts);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function previewUrl(photo: PhotoEntry): string {
    return URL.createObjectURL(photo.blob);
  }
</script>

<svelte:head>
  <title>Neuer Bake – Lievito</title>
</svelte:head>

<div class="container">
  <header class="page-header">
    <p class="kicker">Backjournal</p>
    <h1>Neuer Bake</h1>
  </header>

  <form onsubmit={handleSubmit} class="form">
    <Card title="Wann">
      <label class="field">
        <span>Backdatum</span>
        <input type="datetime-local" bind:value={bakedAt} required />
      </label>
    </Card>

    <Card title="Bewertung">
      <div class="rating-row" role="radiogroup" aria-label="Bewertung von 1 bis 5">
        {#each [1, 2, 3, 4, 5] as n (n)}
          <button
            type="button"
            class="star"
            class:active={(typeof rating === 'number' ? rating : 0) >= n}
            aria-label="{n} Sterne"
            aria-pressed={rating === n}
            onclick={() => (rating = n as 1 | 2 | 3 | 4 | 5)}
          >
            ★
          </button>
        {/each}
      </div>
    </Card>

    <Card title="Notizen">
      <textarea
        rows="4"
        bind:value={notes}
        placeholder="Was lief gut, was nicht? Hydration, Belag, Backzeit…"
      ></textarea>
    </Card>

    <Card title="Ofen">
      <div class="grid-2">
        <label class="field">
          <span>Typ</span>
          <select bind:value={ovenType}>
            <option value="haushaltsofen">Haushaltsofen</option>
            <option value="forno">Pizzaofen</option>
            <option value="grill">Grill</option>
          </select>
        </label>
        <label class="field">
          <span>Temperatur (°C)</span>
          <input type="number" bind:value={ovenTemp} min="100" max="600" />
        </label>
        <label class="field">
          <span>Backzeit (Sek.)</span>
          <input type="number" bind:value={bakingTimeSec} min="30" max="1800" />
        </label>
        <label class="field">
          <span>Tags (Komma-getrennt)</span>
          <input type="text" bind:value={tagsRaw} placeholder="margherita, sourdough" />
        </label>
      </div>
    </Card>

    <Card title="Fotos">
      <input type="file" accept="image/*" multiple onchange={handleFiles} />
      {#if pending.length}
        <ul class="thumbs">
          {#each pending as photo (photo.id)}
            <li>
              <img src={previewUrl(photo)} alt="" />
              <button type="button" onclick={() => removePhoto(photo.id)} aria-label="Foto entfernen">
                ×
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </Card>

    {#if error}<p class="error">{error}</p>{/if}

    <div class="actions">
      <Button variant="ghost" href="/journal">Abbrechen</Button>
      <Button type="submit" disabled={saving}>{saving ? 'Speichere…' : 'Eintrag speichern'}</Button>
    </div>
  </form>
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
  .form {
    display: grid;
    gap: var(--space-4);
  }
  .field {
    display: grid;
    gap: var(--space-1);
  }
  .field span {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }
  input,
  select,
  textarea {
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-2) var(--space-3);
    font: inherit;
    color: var(--color-text);
  }
  textarea {
    resize: vertical;
    width: 100%;
  }
  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3);
  }
  @media (max-width: 600px) {
    .grid-2 {
      grid-template-columns: 1fr;
    }
  }
  .rating-row {
    display: flex;
    gap: var(--space-2);
  }
  .star {
    font-size: var(--text-2xl);
    color: var(--color-border);
    transition: color var(--duration-fast) var(--ease-standard);
  }
  .star.active,
  .star:hover {
    color: var(--color-accent);
  }
  .thumbs {
    list-style: none;
    padding: 0;
    margin: var(--space-3) 0 0;
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
  .thumbs li {
    position: relative;
    width: 5rem;
    height: 5rem;
    overflow: hidden;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
  }
  .thumbs img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .thumbs button {
    position: absolute;
    top: 0.15rem;
    right: 0.15rem;
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    font-size: 0.85rem;
    line-height: 1;
  }
  .actions {
    display: flex;
    gap: var(--space-3);
    justify-content: flex-end;
  }
  .error {
    color: var(--color-danger);
  }
</style>
