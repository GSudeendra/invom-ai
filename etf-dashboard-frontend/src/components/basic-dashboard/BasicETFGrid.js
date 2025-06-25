// BasicETFGrid.js - Simple ETF grid stub
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import BasicETFCard from './BasicETFCard';

export default function BasicETFGrid({ etfs: propsEtfs, watchlist = [], onToggleWatchlist, loading: parentLoading, error: parentError }) {
  const [etfs, setEtfs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Get sort state from query params or default
  const sortBy = searchParams.get('sortBy') || 'schemeName';
  const order = searchParams.get('order') || 'asc';

  // Use etfs from props if provided, otherwise fetch from backend
  useEffect(() => {
    if (propsEtfs && propsEtfs.length > 0) {
      setEtfs(propsEtfs);
      return;
    }

    setLoading(true);
    setError(null);

    axios.get(`http://localhost:3001/api/etfs?sortBy=${sortBy}&order=${order}`, {
      timeout: 10000,
      withCredentials: true
    })
      .then(res => {
        if (res.data && res.data.data) {
          setEtfs(res.data.data || []);
          console.log('ETF data loaded:', res.data.data.length, 'items');
        } else {
          console.warn('Received empty or malformed data from API', res.data);
          setEtfs([]);
          setError('No ETF data available');
        }
      })
      .catch(err => {
        console.error('Error fetching ETF data:', err);
        setError(err?.response?.data?.message || err?.message || 'Failed to fetch ETFs');
      })
      .finally(() => setLoading(false));
  }, [propsEtfs, sortBy, order]);

  // Handle sort control click
  const handleSort = (field) => {
    if (sortBy === field) {
      setSearchParams({ sortBy: field, order: order === 'asc' ? 'desc' : 'asc' });
    } else {
      setSearchParams({ sortBy: field, order: 'asc' });
    }
  };

  if (loading || parentLoading) {
    return (
      <div className="etfgrid-loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading ETFs...</div>
      </div>
    );
  }

  if (error || parentError) {
    return (
      <div className="etfgrid-error">
        <div className="error-message">
          {(error || parentError)?.toString() || 'An error occurred while loading ETFs'}
        </div>
        <button onClick={() => window.location.reload()} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  if (!etfs || etfs.length === 0) {
    return (
      <div className="etfgrid-empty">
        <div className="empty-message">No ETFs found for this category</div>
        <div className="empty-suggestion">Try changing your search criteria or refresh the page</div>
      </div>
    );
  }

  return (
    <div className="etf-grid">
      <div className="sort-controls" style={{ marginBottom: 12 }}>
        <button onClick={() => handleSort('schemeName')} className={sortBy === 'schemeName' ? 'active' : ''}>
          Sort by Name {sortBy === 'schemeName' ? (order === 'asc' ? '↑' : '↓') : ''}
        </button>
        <button onClick={() => handleSort('latestNav')} className={sortBy === 'latestNav' ? 'active' : ''}>
          Sort by NAV {sortBy === 'latestNav' ? (order === 'asc' ? '↑' : '↓') : ''}
        </button>
        <button onClick={() => handleSort('dailyChangePercent')} className={sortBy === 'dailyChangePercent' ? 'active' : ''}>
          Sort by Change % {sortBy === 'dailyChangePercent' ? (order === 'asc' ? '↑' : '↓') : ''}
        </button>
      </div>
      <div className="grid">
        {etfs.map((etf) => (
          <BasicETFCard
            key={etf.amfiCode || etf.symbol}
            etf={etf}
            isInWatchlist={!!watchlist.find(w => w.amfiCode === etf.amfiCode || w.symbol === etf.symbol)}
            onToggleWatchlist={() => onToggleWatchlist(etf)}
          />
        ))}
      </div>
    </div>
  );
}
