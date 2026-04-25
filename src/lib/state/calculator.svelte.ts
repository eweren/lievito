// Calculator-State. Ein einziges `$state`-Objekt, das den
// Rechner-Input hält. Der abgeleitete `$derived`-Wert ist das
// Ergebnis. URL-Sync läuft über einen `$effect` auf der Seite, nicht
// hier im Modul, damit der Effect-Owner immer die Komponente bleibt.

import { calculateDirectDough } from '$lib/dough/calculate';
import { STYLES } from '$lib/dough/styles';
import { CURRENT_SCHEMA_VERSION } from '$lib/types/schema';
import type {
  DoughCalculationInput,
  DoughCalculationResult,
  DoughStyle,
  FlourType,
  PreFermentType,
  YeastType
} from '$lib/types/schema';
import type { URLStateConfig } from './url-state.svelte';

const DEFAULT_STYLE: DoughStyle = 'neapoletana';

export function defaultInput(style: DoughStyle = DEFAULT_STYLE): DoughCalculationInput {
  return { ...STYLES[style].defaults };
}

export function isDefaultInput(input: DoughCalculationInput): boolean {
  const def = STYLES[input.style].defaults;
  const keys = Object.keys(def) as (keyof DoughCalculationInput)[];
  return keys.every((k) => input[k] === def[k]);
}

class CalculatorStore {
  input = $state<DoughCalculationInput>(defaultInput());
  result = $derived<DoughCalculationResult>(calculateDirectDough(this.input));

  setStyle(style: DoughStyle) {
    this.input = defaultInput(style);
  }

  reset() {
    this.input = defaultInput(this.input.style);
  }

  patch(partial: Partial<DoughCalculationInput>) {
    this.input = { ...this.input, ...partial };
  }
}

export const calculator = new CalculatorStore();

// ----- URL-Serialisierung ---------------------------------------------------

const NUM_KEYS = [
  'pizzaCount',
  'ballWeight',
  'hydration',
  'saltPercent',
  'yeastPercent',
  'maturationHours',
  'maturationTemp',
  'preFermentRatio',
  'preFermentHydration',
  'oilPercent',
  'sugarPercent'
] as const;

const STR_KEYS = ['style', 'yeastType', 'flourType', 'preFerment'] as const;

const STYLE_VALUES: DoughStyle[] = ['neapoletana', 'romana', 'ny', 'pan'];
const YEAST_VALUES: YeastType[] = ['fresh', 'dry', 'lievito-madre'];
const FLOUR_VALUES: FlourType[] = ['tipo00', 'tipo1', 'tipo2', 'vollkorn'];
const PRE_VALUES: PreFermentType[] = ['none', 'poolish', 'biga', 'lievito-madre'];

function isValid<T extends string>(allowed: readonly T[], v: string | null): v is T {
  return v !== null && (allowed as readonly string[]).includes(v);
}

export const calculatorUrlConfig: URLStateConfig<DoughCalculationInput> = {
  fromParams(params) {
    const style = isValid(STYLE_VALUES, params.get('style')) ? params.get('style') as DoughStyle : DEFAULT_STYLE;
    const base = defaultInput(style);
    const result: DoughCalculationInput = { ...base };

    for (const key of NUM_KEYS) {
      const raw = params.get(key);
      if (raw === null || raw === '') continue;
      const num = Number(raw);
      if (!Number.isFinite(num)) continue;
      (result as unknown as Record<string, unknown>)[key] = num;
    }

    const yeastType = params.get('yeastType');
    if (isValid(YEAST_VALUES, yeastType)) result.yeastType = yeastType;

    const flourType = params.get('flourType');
    if (isValid(FLOUR_VALUES, flourType)) result.flourType = flourType;

    const preFerment = params.get('preFerment');
    if (isValid(PRE_VALUES, preFerment)) result.preFerment = preFerment;

    result.schemaVersion = CURRENT_SCHEMA_VERSION;
    return result;
  },

  toParams(state) {
    const params = new URLSearchParams();
    const def = STYLES[state.style].defaults as unknown as Record<string, unknown>;
    const src = state as unknown as Record<string, unknown>;
    for (const key of STR_KEYS) {
      const value = src[key];
      if (value !== def[key] && value !== undefined) {
        params.set(key, String(value));
      }
    }
    for (const key of NUM_KEYS) {
      const value = src[key];
      if (value === undefined) continue;
      if (def[key] === value) continue;
      params.set(key, String(value));
    }
    return params;
  },

  keepCleanWhenDefault: true,
  isDefault(state) {
    return isDefaultInput(state);
  }
};
