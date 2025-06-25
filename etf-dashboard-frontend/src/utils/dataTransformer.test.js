import { transformEtfData } from './dataTransformer';

describe('transformEtfData', () => {
  it('transforms ETF data correctly', () => {
    const input = [{ schemeName: 'ETF', nav: 100, date: '2024-06-22' }];
    const output = transformEtfData(input);
    expect(Array.isArray(output)).toBe(true);
    expect(output[0]).toHaveProperty('schemeName');
    expect(output[0]).toHaveProperty('nav');
    expect(output[0]).toHaveProperty('date');
  });
  it('handles empty input', () => {
    expect(transformEtfData([])).toEqual([]);
  });
}); 