import { renderHook, act, waitFor } from '@testing-library/react';
import useCategories from './useCategories';

jest.mock('../api/etfApi', () => ({
  fetchCategories: jest.fn()
}));

const { fetchCategories } = require('../api/etfApi');

// This test file covers requirements from backend/FUNCTIONALITY.md section: Robust API Backend, Category Filtering

describe('useCategories', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches and returns categories', async () => {
    fetchCategories.mockResolvedValueOnce([
      { key: 'large-cap', label: 'Large Cap' },
      { key: 'mid-cap', label: 'Mid Cap' }
    ]);
    const { result } = renderHook(() => useCategories());
    await waitFor(() => {
      expect(result.current.categories).toEqual([
        { key: 'large-cap', label: 'Large Cap' },
        { key: 'mid-cap', label: 'Mid Cap' }
      ]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
}); 