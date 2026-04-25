// Theme-Management. Speichert Wahl in localStorage und schaltet
// `data-theme` am Root-Element. `auto` folgt prefers-color-scheme.

import { browser } from '$app/environment';

export type Theme = 'auto' | 'light' | 'forno';

const STORAGE_KEY = 'lievito.theme';

const initial = ((): Theme => {
  if (!browser) return 'auto';
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'light' || stored === 'forno' || stored === 'auto' ? stored : 'auto';
})();

class ThemeStore {
  current = $state<Theme>(initial);

  set(value: Theme) {
    this.current = value;
    if (browser) {
      localStorage.setItem(STORAGE_KEY, value);
      document.documentElement.dataset.theme = value;
    }
  }

  toggle() {
    const next: Theme = this.current === 'forno' ? 'light' : 'forno';
    this.set(next);
  }
}

export const theme = new ThemeStore();

export function applyThemeFromStorage() {
  if (!browser) return;
  document.documentElement.dataset.theme = theme.current;
}
