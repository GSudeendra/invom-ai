import { fetchWithTimeout } from './networkUtils';

global.fetch = jest.fn();

describe('fetchWithTimeout', () => {
  afterEach(() => jest.clearAllMocks());

  it('resolves with fetch result', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: 1 }) });
    const res = await fetchWithTimeout('url');
    expect(res.ok).toBe(true);
  });

  it('rejects on timeout', async () => {
    jest.useFakeTimers();
    fetch.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ ok: true }), 2000)));
    const promise = fetchWithTimeout('url', {}, 100);
    jest.advanceTimersByTime(200);
    await expect(promise).rejects.toThrow(/timeout/i);
    jest.useRealTimers();
  });
}); 