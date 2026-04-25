<script lang="ts">
  import { page } from '$app/state';
  import { theme } from '$lib/state/theme.svelte';

  const links: { href: string; label: string }[] = [
    { href: '/rechner', label: 'Rechner' },
    { href: '/rezepte', label: 'Rezepte' },
    { href: '/journal', label: 'Backjournal' },
    { href: '/timer', label: 'Timer' },
    { href: '/pizzaiolo', label: 'Pizzaiolo' },
    { href: '/mehl', label: 'Mehl-Lexikon' }
  ];

  function isActive(href: string) {
    return page.url.pathname === href || page.url.pathname.startsWith(href + '/');
  }
</script>

<header class="header">
  <div class="container header-inner">
    <a href="/" class="brand" aria-label="Lievito Startseite">
      <span class="brand-mark" aria-hidden="true">L</span>
      <span class="brand-name">Lievito</span>
    </a>
    <nav aria-label="Hauptnavigation" class="nav">
      <ul>
        {#each links as link (link.href)}
          <li>
            <a
              href={link.href}
              class:active={isActive(link.href)}
              aria-current={isActive(link.href) ? 'page' : undefined}
            >
              {link.label}
            </a>
          </li>
        {/each}
      </ul>
    </nav>
    <button
      type="button"
      class="theme-toggle"
      onclick={() => theme.toggle()}
      aria-label="Forno-Modus umschalten"
      title="Forno-Modus"
    >
      {#if theme.current === 'forno'}
        ☀
      {:else}
        ☾
      {/if}
    </button>
  </div>
</header>

<style>
  .header {
    border-bottom: 1px solid var(--color-border);
    background: color-mix(in oklch, var(--color-bg), transparent 5%);
    backdrop-filter: blur(12px);
    position: sticky;
    top: 0;
    z-index: 10;
    padding-block: env(safe-area-inset-top) 0;
  }
  .header-inner {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    min-height: var(--header-height);
  }
  .brand {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--color-text);
    text-decoration: none;
    font-family: var(--font-display);
    font-weight: 600;
  }
  .brand-mark {
    display: inline-grid;
    place-items: center;
    width: 2rem;
    height: 2rem;
    border-radius: var(--radius-md);
    background: var(--color-accent);
    color: var(--color-pergamena);
    font-family: var(--font-display);
    font-weight: 700;
  }
  .brand-name {
    font-size: var(--text-lg);
  }
  .nav {
    flex: 1;
    overflow-x: auto;
    scrollbar-width: thin;
  }
  .nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    gap: var(--space-1);
  }
  .nav a {
    display: inline-block;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    color: var(--color-text-muted);
    text-decoration: none;
    font-size: var(--text-sm);
    white-space: nowrap;
  }
  .nav a:hover {
    background: var(--color-surface);
    color: var(--color-text);
  }
  .nav a.active {
    color: var(--color-accent);
    background: var(--color-surface);
  }
  .theme-toggle {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: var(--radius-pill);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    font-size: var(--text-base);
    transition: background-color var(--duration-fast) var(--ease-standard);
  }
  .theme-toggle:hover {
    background: var(--color-surface);
  }

  @media (max-width: 720px) {
    .brand-name {
      display: none;
    }
  }
</style>
