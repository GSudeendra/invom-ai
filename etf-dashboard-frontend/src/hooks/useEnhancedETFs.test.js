import { renderHook, act, waitFor } from '@testing-library/react';
import { useEnhancedETFs } from './useEnhancedETFs';

jest.mock('../api/enhancedEtfApi', () => ({
  fetchEnhancedETFs: jest.fn()
}));

const { fetchEnhancedETFs } = require('../api/enhancedEtfApi');

describe('useEnhancedETFs', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches and returns enhanced ETFs', async () => {
    fetchEnhancedETFs.mockResolvedValueOnce([{ schemeName: 'Enhanced ETF' }]);
    const { result } = renderHook(() => useEnhancedETFs());
    expect(result.current.loading).toBe(true);
    await waitFor(() => {
      expect(result.current.data).toEqual([{ schemeName: 'Enhanced ETF' }]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it('sets error on fetch failure', async () => {
    fetchEnhancedETFs.mockRejectedValueOnce(new Error('Network error'));
    const { result } = renderHook(() => useEnhancedETFs());
    await waitFor(() => {
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeDefined();
      expect(result.current.loading).toBe(false);
    });
  });
}); 