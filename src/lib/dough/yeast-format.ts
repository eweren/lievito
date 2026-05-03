import type { YeastType } from '$lib/types/schema';

// Grobe Umrechnung Gramm → Messerspitzen.
// Frischhefe ist feuchter und schwerer als Trockenhefe.
const GRAMS_PER_PINCH: Record<YeastType, number> = {
  fresh: 0.4,
  dry: 0.3,
  'lievito-madre': 0 // nie als Messerspitze dosiert
};

/**
 * Formatiert eine Hefemenge:
 *   ≥ 1 g          → "1.5 g"
 *   < 1 g (mit Msp) → "0.3 g (≈ 1 Messerspitze)"
 *   < halbe Msp    → "0.05 g (Hauch — kaum mehr wiegbar)"
 *   Lievito Madre  → immer in Gramm.
 */
export function formatYeast(grams: number, type: YeastType): string {
  if (type === 'lievito-madre' || grams >= 1) {
    return `${grams.toLocaleString('de-DE', { maximumFractionDigits: 1, minimumFractionDigits: grams < 10 ? 1 : 0 })} g`;
  }
  const perPinch = GRAMS_PER_PINCH[type];
  const pinches = grams / perPinch;
  const gramsStr = grams.toLocaleString('de-DE', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
  if (pinches < 0.5) {
    return `${gramsStr} g (Hauch — kaum mehr wiegbar)`;
  }
  const rounded = Math.round(pinches * 2) / 2; // halbe Messerspitzen
  const label = rounded === 1 ? 'Messerspitze' : 'Messerspitzen';
  const pinchStr = rounded.toLocaleString('de-DE', { maximumFractionDigits: 1 });
  return `${gramsStr} g (≈ ${pinchStr} ${label})`;
}
