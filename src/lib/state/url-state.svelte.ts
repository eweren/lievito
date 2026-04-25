// URL-State-Helfer.
//
// Idee: serialisiere ein flaches Objekt in/aus URL-Searchparameters,
// pushHistory beim Schreiben, Reaktivität via Svelte-Runes. Wir lesen
// initial aus `page.url.searchParams` und schreiben Updates per
// `replaceState` auf der gleichen Seite – das hält die URL immer
// teilbar, ohne den History-Stack vollzumüllen.

import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { page } from '$app/state';

export interface URLStateConfig<T> {
  fromParams: (params: URLSearchParams) => T;
  toParams: (state: T) => URLSearchParams;
  /** Wenn `true`, wird die URL nicht aktualisiert solange Werte gleich Default sind. */
  keepCleanWhenDefault?: boolean;
  isDefault?: (state: T) => boolean;
}

/**
 * Liest den initialen Zustand aus der URL. Server-seitig wird `params`
 * leer sein (statisches Rendering), was die Defaults durchgehen lässt.
 */
export function readInitialFromUrl<T>(config: URLStateConfig<T>): T {
  if (!browser) {
    return config.fromParams(new URLSearchParams());
  }
  return config.fromParams(page.url.searchParams);
}

/**
 * Schreibt den State in die URL. Verwendet `replaceState`, damit der
 * Back-Button nicht jeden Slider-Schritt erinnert.
 */
export function writeStateToUrl<T>(state: T, config: URLStateConfig<T>): void {
  if (!browser) return;
  const params = config.toParams(state);
  const target = new URL(page.url);
  if (config.keepCleanWhenDefault && config.isDefault?.(state)) {
    target.search = '';
  } else {
    target.search = params.toString();
  }
  if (target.search === page.url.search) return;
  goto(target.pathname + target.search, {
    replaceState: true,
    keepFocus: true,
    noScroll: true
  }).catch(() => undefined);
}
