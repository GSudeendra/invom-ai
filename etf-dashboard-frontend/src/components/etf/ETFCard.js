import React, { useState } from 'react';
import { formatPrice, formatPercent } from '../../utils/format';
import ETF52WeekStats from './ETF52WeekStats';

const formatCurrency = (value) => {
  if (!value || isNaN(value)) return 'N/A';
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatVolume = (value) => {
  if (!value || isNaN(value)) return 'N/A';
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

export default function ETFCard({ etf, liveMode, liveData }) {
  const [showStats, setShowStats] = useState(false);
  
  // Use live data if available, otherwise use cached data
  const data = (liveMode && liveData) ? liveData : etf;
  
  // Extract price data - prioritize live data fields
  const currentPrice = data?.ltP || data?.latestNav || data?.currentPrice || data?.nav;
  const previousPrice = data?.prevClose || data?.previousClose || data?.prevNav;
  const openPrice = data?.open;
  
  // Calculate price changes
  const priceChange = currentPrice && previousPrice ? currentPrice - previousPrice : null;
  const priceChangePercent = priceChange && previousPrice ? (priceChange / previousPrice) * 100 : null;
  
  // Use live percentage change if available
  const liveChangePercent = data?.per;
  const finalChangePercent = liveMode && liveChangePercent !== undefined ? liveChangePercent : priceChangePercent;

  // Debug logging for percentage values
  if (liveMode && liveChangePercent !== undefined) {
    console.log('Live change percent:', liveChangePercent, 'Type:', typeof liveChangePercent);
  }

  const isPositive = finalChangePercent && finalChangePercent > 0;
  const isNegative = finalChangePercent && finalChangePercent < 0;

  // Extract live data fields
  const dailyHigh = data?.high;
  const dailyLow = data?.low;
  const volume = data?.qty;
  const tradeValue = data?.trdVal;
  const yearlyChange = data?.yPC;
  const monthlyChange = data?.mPC;

  return (
    <div className="card-hover p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {data?.assets || data?.schemeName || etf?.schemeName || 'Unknown ETF'}
            </h3>
            {liveMode && (
              <div className="live-indicator" title="Live Data"></div>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {data?.symbol || etf?.symbol || 'N/A'} • {data?.amfiCode || etf?.amfiCode || 'N/A'}
          </p>
        </div>
        
        {/* Stats Toggle */}
        <button
          onClick={() => setShowStats(!showStats)}
          className="btn btn-secondary text-xs"
          title={showStats ? "Hide Stats" : "Show Stats"}
        >
          {showStats ? 'Hide' : 'Stats'}
        </button>
      </div>

      {/* Price Section */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-2xl font-bold text-gray-900">
            {formatPrice(currentPrice)}
          </span>
          {finalChangePercent !== null && finalChangePercent !== undefined && (
            <span className={`text-sm font-medium ${
              isPositive ? 'text-success-600' : isNegative ? 'text-danger-600' : 'text-gray-600'
            }`}>
              {isPositive ? '+' : ''}{formatPercent(finalChangePercent)}
            </span>
          )}
        </div>
        
        {priceChange !== null && (
          <div className={`text-sm ${
            isPositive ? 'text-success-600' : isNegative ? 'text-danger-600' : 'text-gray-600'
          }`}>
            {isPositive ? '+' : ''}{formatPrice(Math.abs(priceChange))}
          </div>
        )}
        
        {/* Live Mode Additional Info */}
        {liveMode && (
          <div className="mt-2 space-y-1">
            {openPrice && (
              <div className="text-xs text-gray-500">
                Open: {formatPrice(openPrice)}
              </div>
            )}
            {dailyHigh && dailyLow && (
              <div className="text-xs text-gray-500">
                H: {formatPrice(dailyHigh)} | L: {formatPrice(dailyLow)}
              </div>
            )}
            {volume && (
              <div className="text-xs text-gray-500">
                Vol: {formatVolume(volume)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-500">Category:</span>
          <div className="font-medium text-gray-900">
            {data?.category || etf?.category || 'N/A'}
          </div>
        </div>
        <div>
          <span className="text-gray-500">
            {liveMode ? 'Last Update:' : 'NAV Date:'}
          </span>
          <div className="font-medium text-gray-900">
            {liveMode ? 'Live' : (data?.navDate || etf?.navDate || 'N/A')}
          </div>
        </div>
      </div>

      {/* Live Mode Performance Summary */}
      {liveMode && (yearlyChange !== undefined || monthlyChange !== undefined) && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-xs font-medium text-gray-700 mb-2">Performance</div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {yearlyChange !== undefined && (
              <div>
                <span className="text-gray-500">1Y:</span>
                <span className={`ml-1 font-medium ${yearlyChange >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                  {yearlyChange >= 0 ? '+' : ''}{formatPercent(yearlyChange)}
                </span>
              </div>
            )}
            {monthlyChange !== undefined && (
              <div>
                <span className="text-gray-500">1M:</span>
                <span className={`ml-1 font-medium ${monthlyChange >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                  {monthlyChange >= 0 ? '+' : ''}{formatPercent(monthlyChange)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 52-Week Stats (Collapsible) */}
      {showStats && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <ETF52WeekStats etf={etf} liveData={liveData} />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
        <button className="btn btn-primary flex-1 text-sm">
          View Details
        </button>
        <button className="btn btn-secondary text-sm">
          Compare
        </button>
      </div>
    </div>
  );
}
