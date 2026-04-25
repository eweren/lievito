<script lang="ts">
  const year = new Date().getFullYear();
</script>

<footer class="footer">
  <div class="container">
    <p class="claim">Deine Bakes verlassen dein Gerät nie. Keine Cookies, kein Tracking, kein Account.</p>
    <p class="copy">© {year} Lievito · Local-First mit Liebe</p>
  </div>
</footer>

<style>
  .footer {
    border-top: 1px solid var(--color-border);
    margin-top: var(--space-12);
    padding-block: var(--space-8);
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }
  .claim {
    font-style: italic;
    margin-bottom: var(--space-2);
  }
  .copy {
    font-size: var(--text-xs);
  }
</style>
