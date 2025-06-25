import { ETFCategorizer } from './etfCategorizer';

describe('categorizeETF', () => {
  it('categorizes Nifty 50 ETF correctly', () => {
    const result = ETFCategorizer.categorizeETF('Nifty 50 ETF');
    expect(result.category).toMatch(/nifty/i);
    expect(typeof result.confidence).toBe('number');
  });
  it('categorizes Gold ETF correctly', () => {
    const result = ETFCategorizer.categorizeETF('GoldBees');
    expect(result.category).toMatch(/gold/i);
    expect(typeof result.confidence).toBe('number');
  });
  it('returns Miscellaneous for unknown ETF', () => {
    const result = ETFCategorizer.categorizeETF('Unknown ETF');
    expect(result.category).toMatch(/misc/i);
    expect(typeof result.confidence).toBe('number');
  });
}); 