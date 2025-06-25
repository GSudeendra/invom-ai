import { formatPrice, formatPercent } from './format';

describe('formatPrice', () => {
  it('formats numbers as INR currency', () => {
    expect(formatPrice(1234.56)).toMatch(/\u20b9/);
    expect(formatPrice(0)).toMatch(/\u20b9/);
    expect(formatPrice(-100)).toMatch(/\u20b9-100/);
  });
});

describe('formatPercent', () => {
  it('formats numbers as percent with 2 decimals', () => {
    expect(formatPercent(0.1234)).toBe('+0.12%');
    expect(formatPercent(-0.5)).toBe('-0.50%');
    expect(formatPercent(1)).toBe('+1.00%');
    expect(formatPercent(0)).toBe('+0.00%');
  });
}); 