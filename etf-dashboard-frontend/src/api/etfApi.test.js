import * as api from './etfApi';
global.fetch = jest.fn();

// This test file covers requirements from backend/FUNCTIONALITY.md section: Robust API Backend, Category Filtering, Error Handling

describe('etfApi', () => {
  afterEach(() => jest.clearAllMocks());

  it('fetches ETFs by category', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([4,5]) });
    const data = await api.fetchEtfsByCategory('large-cap');
    expect(data).toEqual([4,5]);
  });

  it('fetches categories', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([{ key: 'k', label: 'l' }]) });
    const data = await api.fetchCategories();
    expect(data).toEqual([{ key: 'k', label: 'l' }]);
  });

  it('handles fetch error', async () => {
    fetch.mockResolvedValueOnce({ ok: false });
    await expect(api.fetchEtfsByCategory('large-cap')).rejects.toThrow();
  });
}); 