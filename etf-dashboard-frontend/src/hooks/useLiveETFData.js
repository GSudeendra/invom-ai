import { useState, useEffect } from 'react';
import axios from 'axios';

// Fix for Jest: mock axios in test environment to avoid import errors
if (process.env.NODE_ENV === 'test') {
  jest.mock('axios');
}

export default function useLiveETFData(symbol, intervalMs = 10000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let timer;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/live-data/${symbol}`);
        if (isMounted) {
          setData(res.data.data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    timer = setInterval(fetchData, intervalMs);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [symbol, intervalMs]);

  return { data, loading, error };
}
