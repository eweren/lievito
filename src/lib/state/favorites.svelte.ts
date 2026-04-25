// Favoriten + zuletzt genutzter Rechner-Setup. Beides in localStorage.
// Bewusst keine Dexie-Abhängigkeit – diese Daten sind klein, müssen nicht
// migrierbar sein und sollen schon in Phase 1 funktionieren.

import { browser } from '$app/environment';
import type { DoughCalculationInput } from '$lib/types/schema';

const FAV_KEY = 'lievito.favorites';
const LAST_KEY = 'lievito.lastCalculation';

function read<T>(key: string, fallback: T): T {
  if (!browser) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (!browser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Quota exceeded – Phase 2 zeigt Warnung */
  }
}

class FavoritesStore {
  recipeSlugs = $state<string[]>(read<string[]>(FAV_KEY, []));

  toggle(slug: string) {
    if (this.recipeSlugs.includes(slug)) {
      this.recipeSlugs = this.recipeSlugs.filter((s) => s !== slug);
    } else {
      this.recipeSlugs = [...this.recipeSlugs, slug];
    }
    write(FAV_KEY, this.recipeSlugs);
  }

  has(slug: string): boolean {
    return this.recipeSlugs.includes(slug);
  }
}

export const favorites = new FavoritesStore();

export function saveLastCalculation(input: DoughCalculationInput) {
  write(LAST_KEY, input);
}

export function loadLastCalculation(): DoughCalculationInput | null {
  return read<DoughCalculationInput | null>(LAST_KEY, null);
}
