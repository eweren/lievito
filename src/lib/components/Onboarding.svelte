<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  const KEY = 'lievito.onboardingDone';

  let visible = $state(false);
  let step = $state(0);

  const slides = [
    {
      icon: '🍕',
      title: 'Willkommen bei Lievito',
      body: 'Die Pizzateig-Werkstatt für deinen Wochenend-Bake. Lokal auf deinem Gerät, ohne Account, ohne Tracking.'
    },
    {
      icon: '🧮',
      title: 'Direktteig-Rechner',
      body: 'Schiebe Idratazione, Salz und Hefe – die Mengen aktualisieren sich live. Jeder Wert lebt in der URL, also einfach Link kopieren und teilen.'
    },
    {
      icon: '📒',
      title: 'Backjournal & Timer',
      body: 'Dokumentiere jeden Bake mit Foto und Bewertung. Lass parallele Timer für Stockgare und Stückgare laufen.'
    },
    {
      icon: '🤖',
      title: 'Pizzaiolo (KI)',
      body: 'Beschreibe Probleme im Klartext, bekomm strukturierte Ursachen und Lösungen. Inhalte gehen an Anthropic – kein Account, aber Tageslimit pro IP.'
    }
  ];

  onMount(() => {
    if (!browser) return;
    const seen = localStorage.getItem(KEY);
    if (!seen) visible = true;
  });

  function dismiss() {
    visible = false;
    if (browser) localStorage.setItem(KEY, '1');
  }

  function next() {
    if (step === slides.length - 1) {
      dismiss();
    } else {
      step++;
    }
  }
</script>

{#if visible}
  <div class="backdrop" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
    <div class="card">
      <button class="close" type="button" onclick={dismiss} aria-label="Schließen">×</button>
      <div class="icon" aria-hidden="true">{slides[step].icon}</div>
      <h2 id="onboarding-title">{slides[step].title}</h2>
      <p>{slides[step].body}</p>
      <nav class="dots" aria-label="Schritt">
        {#each slides as _, i (i)}
          <span class="dot" class:active={i === step}></span>
        {/each}
      </nav>
      <button class="next" type="button" onclick={next}>
        {step === slides.length - 1 ? 'Loslegen' : 'Weiter'}
      </button>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: oklch(0% 0 0 / 0.55);
    display: grid;
    place-items: center;
    padding: var(--space-4);
    z-index: 100;
    animation: fade var(--duration-normal) var(--ease-standard);
  }
  .card {
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-8);
    max-width: 28rem;
    text-align: center;
    box-shadow: var(--shadow-lg);
    position: relative;
    animation: lift var(--duration-slow) var(--ease-standard);
  }
  .close {
    position: absolute;
    top: var(--space-2);
    right: var(--space-2);
    width: 2rem;
    height: 2rem;
    border-radius: var(--radius-md);
    color: var(--color-text-muted);
    font-size: var(--text-xl);
    line-height: 1;
  }
  .close:hover {
    background: var(--color-surface);
    color: var(--color-text);
  }
  .icon {
    font-size: 3rem;
    margin-bottom: var(--space-3);
  }
  h2 {
    margin-bottom: var(--space-3);
  }
  p {
    color: var(--color-text-muted);
  }
  .dots {
    margin: var(--space-6) 0 var(--space-4);
    display: flex;
    gap: var(--space-2);
    justify-content: center;
  }
  .dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: var(--color-border);
    transition: background-color var(--duration-fast) var(--ease-standard);
  }
  .dot.active {
    background: var(--color-accent);
  }
  .next {
    background: var(--color-accent);
    color: var(--color-pergamena);
    padding: var(--space-2) var(--space-6);
    border-radius: var(--radius-md);
    font-weight: 500;
  }
  .next:hover {
    background: var(--color-accent-hover);
  }
  @keyframes fade {
    from {
      opacity: 0;
    }
  }
  @keyframes lift {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
  }
</style>
