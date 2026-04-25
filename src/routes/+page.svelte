<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import { RECIPES } from '$lib/recipes';
  import RecipeCard from '$lib/components/RecipeCard.svelte';

  const featured = $derived(RECIPES.slice(0, 3));

  // Schema.org-Markup für die Software-Application.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Lievito',
    description:
      'Local-First Pizzateig-Werkstatt: Direktteig-Rechner, Backjournal, KI-Pizzaiolo. Ohne Account, ohne Tracking.',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' }
  };
</script>

<svelte:head>
  <title>Lievito – die Pizzateig-Werkstatt</title>
  <meta
    name="description"
    content="Lievito ist die Local-First Pizzateig-Werkstatt: Direktteig-Rechner, kuratierte Rezepte, Backjournal und KI-Pizzaiolo. Ohne Account, ohne Tracking, ohne Cloud."
  />
  <meta property="og:title" content="Lievito – die Pizzateig-Werkstatt" />
  <meta property="og:image" content="/og-default.png" />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}<\/script>`}
</svelte:head>

<div class="container">
  <section class="hero">
    <p class="kicker">Pizzateig-Werkstatt</p>
    <h1>Vom Mehl zum perfekten Cornicione.</h1>
    <p class="lead">
      Lievito rechnet, dokumentiert und begleitet – lokal auf deinem Gerät. Keine Cookies,
      keine Cloud, keine Konten. Nur du, dein Teig und ein Werkzeug, das mit dir
      mitdenkt.
    </p>
    <div class="cta">
      <Button href="/rechner">Direktteig-Rechner öffnen</Button>
      <Button href="/rezepte" variant="ghost">Rezepte ansehen</Button>
    </div>
  </section>

  <section class="features">
    <article>
      <h2>Rechner mit URL-State</h2>
      <p>
        Idratazione, Salz, Hefe, Maturazione – jeder Wert lebt in der URL. Teile
        deinen Teig per Link, ohne Backend, ohne Account.
      </p>
    </article>
    <article>
      <h2>Local-First</h2>
      <p>
        Backjournal, Timer und Chat-Verlauf liegen nur auf deinem Gerät. Export
        und Import als JSON, Multi-Device per Datei – nicht per Cloud.
      </p>
    </article>
    <article>
      <h2>Offline ehrlich</h2>
      <p>
        Service Worker, PWA-Manifest, präziser Cache. Lievito funktioniert in
        der Bahn, im Forno und ohne WLAN.
      </p>
    </article>
  </section>

  <section class="featured">
    <header class="section-head">
      <h2>Frische Rezepte</h2>
      <a class="see-all" href="/rezepte">Alle Rezepte →</a>
    </header>
    <div class="grid">
      {#each featured as recipe (recipe.slug)}
        <RecipeCard {recipe} />
      {/each}
    </div>
  </section>
</div>

<style>
  .hero {
    padding-block: var(--space-12) var(--space-10);
    max-width: 48rem;
  }
  .kicker {
    color: var(--color-accent);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  h1 {
    font-size: clamp(2.25rem, 6vw, 3.75rem);
    margin-top: var(--space-3);
  }
  .lead {
    color: var(--color-text-muted);
    margin-top: var(--space-4);
    font-size: var(--text-lg);
    max-width: 38rem;
  }
  .cta {
    display: flex;
    gap: var(--space-3);
    margin-top: var(--space-6);
    flex-wrap: wrap;
  }
  .features {
    display: grid;
    gap: var(--space-6);
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
    margin-block: var(--space-10);
    padding-block: var(--space-8);
    border-top: 1px solid var(--color-border);
    border-bottom: 1px solid var(--color-border);
  }
  .features h2 {
    font-size: var(--text-lg);
    margin-bottom: var(--space-2);
  }
  .features p {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }
  .featured {
    margin-block: var(--space-10);
  }
  .section-head {
    display: flex;
    justify-content: space-between;
    align-items: end;
    margin-bottom: var(--space-4);
  }
  .see-all {
    font-size: var(--text-sm);
  }
  .grid {
    display: grid;
    gap: var(--space-4);
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
  }
</style>
