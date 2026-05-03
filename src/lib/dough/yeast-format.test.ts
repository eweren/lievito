import { describe, expect, it } from 'vitest';
import { formatYeast } from './yeast-format';

describe('formatYeast', () => {
  it('zeigt ≥ 1 g rein in Gramm', () => {
    expect(formatYeast(2.5, 'fresh')).toMatch(/^2,5 g$/);
    expect(formatYeast(15, 'dry')).toMatch(/^15 g$/);
  });

  it('ergänzt Messerspitzen-Hinweis bei < 1 g Frischhefe', () => {
    expect(formatYeast(0.4, 'fresh')).toContain('Messerspitze');
    expect(formatYeast(0.8, 'fresh')).toContain('Messerspitzen');
  });

  it('warnt bei winzigen Mengen (Hauch)', () => {
    expect(formatYeast(0.05, 'fresh')).toContain('Hauch');
    expect(formatYeast(0.05, 'dry')).toContain('Hauch');
  });

  it('Lievito Madre wird immer in Gramm gezeigt', () => {
    expect(formatYeast(45, 'lievito-madre')).toMatch(/^45 g$/);
    expect(formatYeast(0.5, 'lievito-madre')).not.toContain('Messerspitze');
  });
});
