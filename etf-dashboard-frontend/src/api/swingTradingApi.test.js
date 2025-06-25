import * as api from './swingTradingApi';
global.fetch = jest.fn();

describe('swingTradingApi', () => {
  afterEach(() => jest.clearAllMocks());

  it('fetches swing trading analysis', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([1,2,3]) });
    const data = await api.fetchSwingTradingAnalysis();
    expect(data).toEqual([1,2,3]);
  });

  it('fetches swing trading signals', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([4,5]) });
    const data = await api.fetchSwingTradingSignals();
    expect(data).toEqual([4,5]);
  });

  it('handles fetch error', async () => {
    fetch.mockResolvedValueOnce({ ok: false });
    await expect(api.fetchSwingTradingAnalysis()).rejects.toThrow();
  });
}); 