// Parst einen ```json-Block aus dem Antwort-Text und validiert die
// Diagnose-Struktur. Bei Misslingen geben wir `null` zurück und der
// Plain-Text bleibt sichtbar.

import type { Diagnosis } from '$lib/types/schema';

const JSON_BLOCK = /```json\s*([\s\S]+?)\s*```/i;

export function parseDiagnosis(text: string): Diagnosis | null {
  const match = text.match(JSON_BLOCK);
  if (!match) return null;
  try {
    const obj = JSON.parse(match[1]);
    if (!obj || typeof obj !== 'object') return null;
    if (!Array.isArray(obj.causes) || !Array.isArray(obj.solutions)) return null;
    for (const c of obj.causes) {
      if (typeof c.title !== 'string') return null;
      if (!['high', 'medium', 'low'].includes(c.likelihood)) return null;
      if (typeof c.explanation !== 'string') return null;
    }
    for (const s of obj.solutions) {
      if (typeof s.title !== 'string') return null;
      if (!Array.isArray(s.steps) || !s.steps.every((step: unknown) => typeof step === 'string')) {
        return null;
      }
      if (!['easy', 'medium', 'hard'].includes(s.difficulty)) return null;
    }
    return obj as Diagnosis;
  } catch {
    return null;
  }
}

export function stripDiagnosisBlock(text: string): string {
  return text.replace(JSON_BLOCK, '').trim();
}
