import { renderHook, act, waitFor } from '@testing-library/react';
import useEtfsByCategory from './useEtfsByCategory';

jest.mock('../api/etfApi', () => ({
  fetchEtfsByCategory: jest.fn()
}));

const { fetchEtfsByCategory } = require('../api/etfApi');

// This test file covers requirements from backend/FUNCTIONALITY.md section: Robust API Backend, Category Filtering

describe('useEtfsByCategory', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches and returns ETF data', async () => {
    fetchEtfsByCategory.mockResolvedValueOnce([{ schemeName: 'Test ETF' }]);
    const { result } = renderHook(() => useEtfsByCategory('large-cap'));
    expect(result.current.loading).toBe(true);
    await waitFor(() => {
      expect(result.current.etfs).toEqual([{ schemeName: 'Test ETF' }]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it('sets error on fetch failure', async () => {
    fetchEtfsByCategory.mockRejectedValueOnce(new Error('Network error'));
    const { result } = renderHook(() => useEtfsByCategory('large-cap'));
    await waitFor(() => {
      expect(result.current.etfs).toEqual([]);
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.loading).toBe(false);
    });
  });

  it('triggers new fetch when categoryKey changes', async () => {
    fetchEtfsByCategory.mockResolvedValueOnce([{ schemeName: 'ETF 1' }]);
    const { result, rerender } = renderHook(
      ({ key }) => useEtfsByCategory(key),
      { initialProps: { key: 'large-cap' } }
    );
    await waitFor(() => {
      expect(result.current.etfs[0].schemeName).toBe('ETF 1');
    });
    fetchEtfsByCategory.mockResolvedValueOnce([{ schemeName: 'ETF 2' }]);
    rerender({ key: 'nifty50' });
    await waitFor(() => {
      expect(result.current.etfs[0].schemeName).toBe('ETF 2');
    });
  });
}); 