import type { NewTimerInput } from '$lib/db/timers';
import type { MaturationSplit } from '$lib/dough/calculate';

/**
 * Wandelt einen Maturazione-Ablauf (Stockgare + optional Kühlschrank-Reife
 * + Stückgare) in einen Multi-Step-Timer um.
 */
export function timerFromSplit(label: string, split: MaturationSplit): NewTimerInput {
  const steps: NewTimerInput['steps'] = [
    {
      label: `Stockgare (${split.bulk.temp} °C)`,
      durationSec: split.bulk.hours * 3600
    }
  ];
  if (split.coldRetard) {
    steps.push({
      label: `Kühlschrank-Reife (${split.coldRetard.temp} °C)`,
      durationSec: split.coldRetard.hours * 3600
    });
  }
  steps.push({
    label: `Stückgare (${split.balling.temp} °C)`,
    durationSec: split.balling.hours * 3600
  });
  return { label, steps };
}
