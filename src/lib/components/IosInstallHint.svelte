<script lang="ts">
  // iOS-spezifischer „Zum Home-Bildschirm hinzufügen"-Hinweis.
  // Erscheint nur in iOS-Safari, nur wenn die PWA nicht im Standalone-Mode
  // läuft, und nur, wenn der Nutzer ihn nicht weggeklickt hat.

  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  const KEY = 'lievito.iosInstallHintDismissed';

  let visible = $state(false);

  onMount(() => {
    if (!browser) return;
    const isIos = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isIos) return;
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS-spezifisches Flag
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isStandalone) return;
    if (localStorage.getItem(KEY) === '1') return;
    visible = true;
  });

  function dismiss() {
    visible = false;
    if (browser) localStorage.setItem(KEY, '1');
  }
</script>

{#if visible}
  <aside class="hint" role="region" aria-label="App auf iPhone installieren">
    <div class="content">
      <strong>Auf iPhone installieren</strong>
      <p>
        Tippe unten auf <span class="icon" aria-label="Teilen">⤴</span> und dann auf
        „Zum Home-Bildschirm". Erst dann läuft Lievito offline und ohne Browserleiste.
      </p>
    </div>
    <button type="button" class="close" onclick={dismiss} aria-label="Hinweis schließen">×</button>
  </aside>
{/if}

<style>
  .hint {
    position: fixed;
    left: var(--space-3);
    right: var(--space-3);
    bottom: calc(var(--space-3) + env(safe-area-inset-bottom));
    background: var(--color-bg);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    padding: var(--space-3) var(--space-4);
    display: flex;
    gap: var(--space-3);
    align-items: flex-start;
    z-index: 50;
    animation: slide var(--duration-slow) var(--ease-standard);
  }
  .content {
    flex: 1;
  }
  strong {
    display: block;
    margin-bottom: var(--space-1);
  }
  p {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }
  .icon {
    display: inline-grid;
    place-items: center;
    width: 1.4em;
    height: 1.4em;
    border-radius: var(--radius-sm);
    background: var(--color-surface);
    color: var(--color-accent);
    font-weight: 600;
    margin-inline: 0.15em;
  }
  .close {
    width: 2rem;
    height: 2rem;
    border-radius: var(--radius-md);
    color: var(--color-text-muted);
    font-size: var(--text-lg);
    line-height: 1;
  }
  .close:hover {
    background: var(--color-surface);
    color: var(--color-text);
  }
  @keyframes slide {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
  }
</style>
