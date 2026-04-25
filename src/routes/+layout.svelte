<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { applyThemeFromStorage } from '$lib/state/theme.svelte';

  let { children } = $props();

  onMount(() => {
    applyThemeFromStorage();
  });
</script>

<svelte:head>
  <title>Lievito – die Pizzateig-Werkstatt</title>
</svelte:head>

<div class="app-shell">
  <Header />
  <main id="main" class="main">
    {@render children()}
  </main>
  <Footer />
</div>

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
</style>
