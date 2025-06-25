// BasicETFCard.js - Minimal ETF card stub
import React from 'react';
import useLiveETFData from '../../hooks/useLiveETFData';

export default function BasicETFCard({ etf, isInWatchlist, onToggleWatchlist }) {
  const symbol = etf?.symbol;
  const polling = useLiveETFData(symbol, 5000);
  const data = polling.data;
  const loading = polling.loading;
  const error = polling.error;

  if (!etf) return null;

  return (
    <div className="basic-etf-card">
      {loading && <div>Loading live data...</div>}
      {error && <div>Error loading live data</div>}
      {data && (
        <>
          <div className="etf-header">
            <div className="etf-title">{data.schemeName || data.symbol}</div>
            <div className="etf-symbol">{data.symbol}</div>
          </div>
          <div className="etf-info-row">
            <span className="etf-label">NAV:</span> <span className="etf-value">₹{Number(data.lastPrice || data.latestNav).toFixed(2)}</span>
          </div>
          <div className="etf-info-row">
            <span className="etf-label">Change:</span> <span className={`etf-value ${data.changePercent > 0 ? 'positive' : data.changePercent < 0 ? 'negative' : ''}`}>{data.changePercent}%</span>
          </div>
          <div className="etf-info-row">
            <span className="etf-label">Prev Close:</span> <span className="etf-value">₹{Number(data.previousClose).toFixed(2)}</span>
          </div>
          <div className="etf-info-row">
            <span className="etf-label">Volume:</span> <span className="etf-value">{Number(data.volume).toLocaleString()}</span>
          </div>
          {data.fundHouse && (
            <div className="etf-info-row">
              <span className="etf-label">Fund House:</span> <span className="etf-value">{data.fundHouse}</span>
            </div>
          )}
        </>
      )}
      <button className="watchlist-btn" onClick={onToggleWatchlist}>
        {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
      </button>
    </div>
  );
} 