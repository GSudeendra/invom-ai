const navDataService = require('../../../src/services/core/navDataService');

describe('navDataService', () => {
  it('getAllETFs returns an array of ETF objects with expected keys', async () => {
    const etfs = await navDataService.getAllETFs();
    expect(Array.isArray(etfs)).toBe(true);
    expect(etfs.length).toBeGreaterThan(0);
    const etf = etfs[0];
    expect(etf).toHaveProperty('schemeName');
    expect(etf).toHaveProperty('latestNav');
    expect(etf).toHaveProperty('amfiCode');
  });
}); 