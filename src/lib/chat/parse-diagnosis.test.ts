import { describe, expect, it } from 'vitest';
import { parseDiagnosis, stripDiagnosisBlock } from './parse-diagnosis';

const validResponse = `Klingt nach einem unterreifen Teig.

\`\`\`json
{
  "causes": [
    { "title": "Zu kühl gestockt", "likelihood": "high", "explanation": "Bei 16 °C reicht 24 h selten." }
  ],
  "solutions": [
    {
      "title": "Stube heizen",
      "steps": ["Wohnzimmer auf 22 °C", "Stockgare verlängern um 2-4 h"],
      "difficulty": "easy"
    }
  ]
}
\`\`\``;

describe('parseDiagnosis', () => {
  it('parst gültigen Block', () => {
    const diag = parseDiagnosis(validResponse);
    expect(diag).not.toBeNull();
    expect(diag?.causes).toHaveLength(1);
    expect(diag?.causes[0].likelihood).toBe('high');
    expect(diag?.solutions[0].steps).toHaveLength(2);
  });

  it('liefert null bei fehlendem Block', () => {
    expect(parseDiagnosis('Nur Text, kein JSON.')).toBeNull();
  });

  it('liefert null bei kaputtem JSON', () => {
    expect(parseDiagnosis('```json\n{ kaputt')).toBeNull();
  });

  it('liefert null bei falscher Likelihood', () => {
    const bad = '```json\n{"causes":[{"title":"x","likelihood":"sehr","explanation":"y"}],"solutions":[]}\n```';
    expect(parseDiagnosis(bad)).toBeNull();
  });

  it('strippt JSON-Block aus Text', () => {
    const clean = stripDiagnosisBlock(validResponse);
    expect(clean).not.toMatch(/```json/);
    expect(clean).toMatch(/unterreifen/);
  });
});
