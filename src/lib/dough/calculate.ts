// Direktteig- und Vorteig-Rechner.
// Alle Mengen in Bäckerprozent: Mehl ist immer 100 %, alle anderen
// Zutaten sind Anteile davon. `maturationHours` ist die Gesamt-Maturazione
// (Stock + ggf. Kaltretard + Stück); die Aufteilung erfolgt regelbasiert
// über `splitMaturation`. Die Hefemenge wird gegen die Gesamtdauer und
// Temperatur kalibriert (Referenz: AVPN-Tabellen, 24 h @ 20 °C ≈ 0.1 % Frischhefe).

import type {
  DoughCalculationInput,
  DoughCalculationResult,
  PreFermentType,
  YeastType
} from '$lib/types/schema';

const FRESH_TO_DRY = 3; // Frischhefe ≈ 3× Trockenhefe in Wirkung

/**
 * Schätzt eine geeignete Hefemenge für eine gegebene Stockgare-Dauer und
 * Temperatur. Modell: Hefemenge skaliert grob exponentiell mit der
 * Temperaturabweichung von 22 °C und antiproportional mit der Stunden-Zahl.
 * Die Konstanten sind so gewählt, dass die Standard-Werte (24 h bei 20 °C
 * Frischhefe ≈ 0.1 %) reproduziert werden.
 */
export function suggestYeastPercent(input: {
  hours: number;
  temp: number;
  yeastType: YeastType;
}): number {
  const { hours, temp, yeastType } = input;
  const safeHours = Math.max(1, hours);
  // Basis: Frischhefe-% bei 22 °C
  const base = 1.7 / safeHours;
  const tempFactor = Math.pow(2, (temp - 22) / 10);
  let percent = base * tempFactor;
  if (yeastType === 'dry') percent /= FRESH_TO_DRY;
  if (yeastType === 'lievito-madre') percent *= 80; // grob: 8–15 % auf Mehl
  return Math.max(0.01, round(percent, 3));
}

export function calculateDirectDough(input: DoughCalculationInput): DoughCalculationResult {
  const warnings = collectWarnings(input);

  const totalDough = input.pizzaCount * input.ballWeight;

  // Bäckerprozent-Anteile (Mehl = 100 %)
  let factor = 1 + input.hydration + input.saltPercent / 100 + input.yeastPercent / 100;
  if (input.oilPercent) factor += input.oilPercent / 100;
  if (input.sugarPercent) factor += input.sugarPercent / 100;

  const flour = totalDough / factor;
  const water = flour * input.hydration;
  const salt = flour * (input.saltPercent / 100);
  const yeast = flour * (input.yeastPercent / 100);
  const oil = input.oilPercent ? flour * (input.oilPercent / 100) : undefined;
  const sugar = input.sugarPercent ? flour * (input.sugarPercent / 100) : undefined;

  const split = splitMaturation(input.maturationHours, input.maturationTemp);
  if (split.warning) warnings.push(split.warning);

  if (input.preFerment === 'none') {
    return {
      totalDough: round(totalDough),
      flour: round(flour),
      water: round(water),
      salt: round(salt, 1),
      yeast: round(yeast, 2),
      oil: oil != null ? round(oil, 1) : undefined,
      sugar: sugar != null ? round(sugar, 1) : undefined,
      bulkFermentation: split.bulk,
      coldRetard: split.coldRetard,
      ballingTime: split.balling,
      warnings
    };
  }

  return calculateWithPreFerment({
    input,
    flour,
    water,
    salt,
    yeast,
    oil,
    sugar,
    totalDough,
    split,
    warnings
  });
}

interface PreFermentArgs {
  input: DoughCalculationInput;
  flour: number;
  water: number;
  salt: number;
  yeast: number;
  oil?: number;
  sugar?: number;
  totalDough: number;
  split: MaturationSplit;
  warnings: string[];
}

function calculateWithPreFerment(args: PreFermentArgs): DoughCalculationResult {
  const { input, flour, water, salt, yeast, oil, sugar, totalDough, split, warnings } = args;
  const ratio = clamp(input.preFermentRatio ?? 0.3, 0.05, 0.7);
  const preFermentFlour = flour * ratio;

  const preFermentHydration =
    input.preFermentHydration ?? defaultPreFermentHydration(input.preFerment);
  const preFermentWater = preFermentFlour * preFermentHydration;

  // Hefe im Vorteig: ~10 % der Gesamthefemenge bei Poolish/Biga genügt für 12–18 h.
  const preFermentYeast = yeast * 0.1;

  const mainFlour = flour - preFermentFlour;
  const mainWater = water - preFermentWater;
  const mainYeast = yeast - preFermentYeast;
  const mainSalt = salt; // Salz immer in Hauptteig

  if (mainWater < 0) {
    warnings.push(
      'Vorteig-Hydration zu hoch für die gewählte Gesamt-Hydration. Erhöhe Hydration oder reduziere Vorteig-Anteil.'
    );
  }

  return {
    totalDough: round(totalDough),
    flour: round(flour),
    water: round(water),
    salt: round(salt, 1),
    yeast: round(yeast, 2),
    oil: oil != null ? round(oil, 1) : undefined,
    sugar: sugar != null ? round(sugar, 1) : undefined,
    preFerment: {
      type: input.preFerment,
      flour: round(preFermentFlour),
      water: round(preFermentWater),
      yeast: round(preFermentYeast, 3),
      totalWeight: round(preFermentFlour + preFermentWater + preFermentYeast),
      restHours: defaultPreFermentRest(input.preFerment).hours,
      restTemp: defaultPreFermentRest(input.preFerment).temp
    },
    mainDough: {
      flour: round(mainFlour),
      water: round(Math.max(0, mainWater)),
      salt: round(mainSalt, 1),
      yeast: round(Math.max(0, mainYeast), 3)
    },
    bulkFermentation: split.bulk,
    coldRetard: split.coldRetard,
    ballingTime: split.balling,
    warnings
  };
}

function defaultPreFermentHydration(type: PreFermentType): number {
  switch (type) {
    case 'poolish':
      return 1.0; // 100 % Hydration
    case 'biga':
      return 0.45; // klassisch fest
    case 'lievito-madre':
      return 0.5;
    case 'none':
      return 0;
  }
}

function defaultPreFermentRest(type: PreFermentType): { hours: number; temp: number } {
  switch (type) {
    case 'poolish':
      return { hours: 16, temp: 18 };
    case 'biga':
      return { hours: 18, temp: 18 };
    case 'lievito-madre':
      return { hours: 4, temp: 26 };
    case 'none':
      return { hours: 0, temp: 0 };
  }
}

export interface MaturationSplit {
  bulk: { hours: number; temp: number };
  coldRetard?: { hours: number; temp: number };
  balling: { hours: number; temp: number };
  warning?: string;
}

// Teilt die Gesamt-Maturazione in Stock-, optionale Kalt- und Stückgare auf.
// Warm (≥16 °C): klassisch lange Stockgare (2/3) + kürzere Stückgare (1/3);
// bei sehr kurzen Garezeiten (≤6 h) 50/50.
// Kalt (<16 °C): kurze warme Stockphase, lange Kühlschrank-Reife, warme Stückgare.
export function splitMaturation(total: number, temp: number): MaturationSplit {
  if (temp >= 16) {
    if (total <= 6) {
      const bulk = Math.max(1, Math.round(total / 2));
      return {
        bulk: { hours: bulk, temp },
        balling: { hours: Math.max(1, total - bulk), temp }
      };
    }
    const bulk = Math.ceil((total * 2) / 3);
    return {
      bulk: { hours: bulk, temp },
      balling: { hours: Math.max(1, total - bulk), temp }
    };
  }
  // Kaltgare braucht ≥ 4 h, sonst lohnt der Kühlschrank-Schritt nicht.
  if (total < 4) {
    return {
      bulk: { hours: total, temp },
      balling: { hours: 1, temp: 22 },
      warning:
        'Maturazione zu kurz für klassische Kaltgare. Erhöhe Total auf ≥ 4 h oder wähle wärmere Reife.'
    };
  }
  return {
    bulk: { hours: 1, temp: 22 },
    coldRetard: { hours: total - 3, temp },
    balling: { hours: 2, temp: 22 }
  };
}

function collectWarnings(input: DoughCalculationInput): string[] {
  const w: string[] = [];
  if (input.hydration < 0.45 || input.hydration > 0.95) {
    w.push('Hydration außerhalb sinnvoller Bereiche (0.45 – 0.95).');
  }
  if (input.saltPercent < 1 || input.saltPercent > 4) {
    w.push('Salz außerhalb 1 – 4 % – das schmeckt selten.');
  }
  if (input.maturationHours < 1) {
    w.push('Maturazione unter 1 h ist zu kurz.');
  }
  if (input.pizzaCount < 1 || input.ballWeight < 50) {
    w.push('Pizzaanzahl oder Ballgewicht zu klein.');
  }
  return w;
}

function round(value: number, digits = 0): number {
  const factor = Math.pow(10, digits);
  return Math.round(value * factor) / factor;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}
