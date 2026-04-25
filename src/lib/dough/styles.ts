// Stil-Defaults für die vier in V1 unterstützten Pizza-Schulen.
// Die Werte sind nicht "die Wahrheit", sondern sinnvolle Startpunkte
// für Anfänger – Profis ziehen Slider weiter.

import type { DoughCalculationInput, DoughStyle } from '$lib/types/schema';
import { CURRENT_SCHEMA_VERSION } from '$lib/types/schema';

export interface StyleProfile {
  id: DoughStyle;
  label: string;
  description: string;
  defaults: DoughCalculationInput;
  ranges: {
    hydration: [number, number];
    saltPercent: [number, number];
    yeastPercent: [number, number];
    ballWeight: [number, number];
    maturationHours: [number, number];
    maturationTemp: [number, number];
  };
  hasOil: boolean;
  hasSugar: boolean;
}

export const STYLES: Record<DoughStyle, StyleProfile> = {
  neapoletana: {
    id: 'neapoletana',
    label: 'Neapoletana',
    description:
      'Hohe Hitze, kurzer Bake, weicher Cornicione. AVPN-Standard: 60–62 % Hydration, 2.8–3.0 % Salz, lange Stockgare bei Raumtemperatur.',
    defaults: {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      style: 'neapoletana',
      pizzaCount: 4,
      ballWeight: 250,
      hydration: 0.62,
      saltPercent: 2.8,
      yeastType: 'fresh',
      yeastPercent: 0.1,
      preFerment: 'none',
      maturationHours: 24,
      maturationTemp: 20,
      flourType: 'tipo00'
    },
    ranges: {
      hydration: [0.55, 0.7],
      saltPercent: [2.4, 3.2],
      yeastPercent: [0.02, 0.5],
      ballWeight: [180, 320],
      maturationHours: [8, 72],
      maturationTemp: [4, 26]
    },
    hasOil: false,
    hasSugar: false
  },
  romana: {
    id: 'romana',
    label: 'Romana (tonda)',
    description:
      'Knuspriger, dünner Boden, oft mit Olivenöl. Hydration meist niedriger als napoletana, Stockgare typischerweise im Kühlschrank.',
    defaults: {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      style: 'romana',
      pizzaCount: 4,
      ballWeight: 220,
      hydration: 0.58,
      saltPercent: 2.5,
      yeastType: 'dry',
      yeastPercent: 0.2,
      preFerment: 'none',
      maturationHours: 24,
      maturationTemp: 4,
      flourType: 'tipo00',
      oilPercent: 2
    },
    ranges: {
      hydration: [0.5, 0.65],
      saltPercent: [2.0, 3.0],
      yeastPercent: [0.05, 1.0],
      ballWeight: [160, 280],
      maturationHours: [8, 72],
      maturationTemp: [2, 22]
    },
    hasOil: true,
    hasSugar: false
  },
  ny: {
    id: 'ny',
    label: 'New York',
    description:
      'Etwas dickerer Rand, in 250–270 °C-Etagenofen gebacken. Olivenöl + ein Hauch Zucker für Bräunung.',
    defaults: {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      style: 'ny',
      pizzaCount: 4,
      ballWeight: 280,
      hydration: 0.63,
      saltPercent: 2.0,
      yeastType: 'dry',
      yeastPercent: 0.5,
      preFerment: 'none',
      maturationHours: 48,
      maturationTemp: 4,
      flourType: 'tipo00',
      oilPercent: 2,
      sugarPercent: 1.5
    },
    ranges: {
      hydration: [0.58, 0.7],
      saltPercent: [1.5, 2.6],
      yeastPercent: [0.1, 1.5],
      ballWeight: [200, 380],
      maturationHours: [12, 96],
      maturationTemp: [2, 22]
    },
    hasOil: true,
    hasSugar: true
  },
  pan: {
    id: 'pan',
    label: 'Pan / Detroit',
    description:
      'Hohe Hydration, Backstahl-Pfanne, ausgesprochen luftiger Krume. Längere Gare und mehr Öl.',
    defaults: {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      style: 'pan',
      pizzaCount: 2,
      ballWeight: 450,
      hydration: 0.75,
      saltPercent: 2.0,
      yeastType: 'dry',
      yeastPercent: 0.4,
      preFerment: 'none',
      maturationHours: 24,
      maturationTemp: 4,
      flourType: 'tipo00',
      oilPercent: 4
    },
    ranges: {
      hydration: [0.65, 0.85],
      saltPercent: [1.5, 2.6],
      yeastPercent: [0.1, 1.5],
      ballWeight: [350, 700],
      maturationHours: [8, 72],
      maturationTemp: [2, 22]
    },
    hasOil: true,
    hasSugar: false
  }
};

export const STYLE_LIST: StyleProfile[] = Object.values(STYLES);

export function getStyle(style: DoughStyle): StyleProfile {
  return STYLES[style];
}
