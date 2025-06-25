// SimpleWatchlist.js - Basic watchlist stub
import React from 'react';

export default function SimpleWatchlist({ watchlist, onRemove }) {
  if (!watchlist || watchlist.length === 0) return <div className="simple-watchlist-empty">No ETFs in your watchlist.</div>;
  return (
    <div className="simple-watchlist">
      <div className="watchlist-title">Watchlist ({watchlist.length}/10)</div>
      <ul className="watchlist-list">
        {watchlist.slice(0, 10).map(etf => (
          <li key={etf.amfiCode || etf.symbol} className="watchlist-item">
            <span className="watchlist-etf-name">{etf.schemeName || etf.symbol}</span>
            <button className="watchlist-remove-btn" onClick={() => onRemove(etf)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
} 