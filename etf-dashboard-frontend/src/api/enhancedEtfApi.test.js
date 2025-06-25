import * as api from './enhancedEtfApi';
global.fetch = jest.fn();

describe('enhancedEtfApi', () => {
  afterEach(() => jest.clearAllMocks());

  it('fetches enhanced ETFs', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([1,2,3]) });
    const data = await api.fetchEnhancedETFs();
    expect(data).toEqual([1,2,3]);
  });

  it('fetches combined ETF data', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([4,5]) });
    const data = await api.getCombinedETFData();
    expect(data).toEqual([4,5]);
  });

  it('handles fetch error', async () => {
    fetch.mockResolvedValueOnce({ ok: false });
    await expect(api.fetchEnhancedETFs()).rejects.toThrow();
  });
}); 