import { useState, useEffect, useCallback } from 'react';
import { fetchEtfsByCategory } from '../api/etfApi';

export default function useEtfsByCategory(categoryKey) {
  const [etfs, setEtfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!categoryKey) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await fetchEtfsByCategory(categoryKey);
      setEtfs(data.funds || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [categoryKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { etfs, loading, error, refetch: fetchData };
} 