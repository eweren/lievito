<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import Onboarding from '$lib/components/Onboarding.svelte';
  import { applyThemeFromStorage } from '$lib/state/theme.svelte';

  let { children } = $props();

  onMount(() => {
    applyThemeFromStorage();
  });
</script>

<svelte:head>
  <title>Lievito – die Pizzateig-Werkstatt</title>
</svelte:head>

<a class="skip-link" href="#main">Zum Hauptinhalt springen</a>

<div class="app-shell">
  <Header />
  <main id="main" class="main" tabindex="-1">
    {@render children()}
  </main>
  <Footer />
</div>

<Onboarding />

<style>
  .app-shell {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
  }
  .main {
    flex: 1;
    padding-block: var(--space-6);
  }
  .main:focus {
    outline: none;
  }
  .skip-link {
    position: absolute;
    top: var(--space-2);
    left: var(--space-2);
    z-index: 1000;
    padding: var(--space-2) var(--space-3);
    background: var(--color-accent);
    color: var(--color-pergamena);
    border-radius: var(--radius-md);
    text-decoration: none;
    transform: translateY(-150%);
    transition: transform var(--duration-fast) var(--ease-standard);
  }
  .skip-link:focus {
    transform: translateY(0);
  }
</style>
