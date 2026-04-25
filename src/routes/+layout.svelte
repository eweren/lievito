<script lang="ts">
  import '../app.css';

  let { children } = $props();
</script>

<svelte:head>
  <title>Lievito – die Pizzateig-Werkstatt</title>
</svelte:head>

<div class="app-shell">
  {@render children()}
</div>

<style>
  .app-shell {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
  }
</style>
