import React, { useState } from 'react';
import { formatPrice, formatPercent } from '../../utils/format';
import ETF52WeekStats from './ETF52WeekStats';
import { Eye, CheckSquare, ChevronDown, ChevronUp } from 'lucide-react';

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

export default function ETFCard({ etf, liveMode, liveData, showNavDate, selected, onToggleSelect }) {
  const [showStatsMobile, setShowStatsMobile] = useState(false);
  const [hovered, setHovered] = useState(false);
  
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

  // Only show category if it is not missing or 'N/A'
  const showCategory = data?.category && data?.category !== 'N/A';

  // Responsive: show stats on hover (desktop) or expand (mobile)
  const showDetails = hovered || showStatsMobile;

  return (
    <div
      className={`card-hover relative group transition-all duration-200 ${selected ? 'ring-2 ring-primary-500' : ''} ${showDetails ? 'shadow-medium scale-[1.02]' : ''} p-3 md:p-4`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Compare Checkbox (top right) */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        <input
          type="checkbox"
          checked={!!selected}
          onChange={onToggleSelect}
          className="form-checkbox h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
      </div>
      {/* Compact Header */}
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-base font-semibold text-gray-900  max-w-[70%]">
          {data?.assets || data?.schemeName || etf?.schemeName || 'Unknown ETF'}
        </h3>
        {liveMode && (
          <div className="live-indicator" title="Live Data"></div>
        )}
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-gray-500  max-w-[60px]">
          {data?.symbol || etf?.symbol || 'N/A'}
        </span>
        <span className="text-xs text-gray-400">•</span>
        <span className="text-xs text-gray-400  max-w-[60px]">
          {data?.amfiCode || etf?.amfiCode || 'N/A'}
        </span>
      </div>
      {/* Price Section (always visible) */}
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-xl font-bold text-gray-900">
          {formatPrice(currentPrice)}
        </span>
        {finalChangePercent !== null && finalChangePercent !== undefined && (
          <span className={`text-xs font-medium ${
            isPositive ? 'text-success-600' : isNegative ? 'text-danger-600' : 'text-gray-600'
          }`}>
            {isPositive ? '+' : ''}{formatPercent(finalChangePercent)}
          </span>
        )}
      </div>
      {/* Price change (absolute) */}
      {priceChange !== null && (
        <div className={`text-xs ${
          isPositive ? 'text-success-600' : isNegative ? 'text-danger-600' : 'text-gray-600'
        }`}>
          {isPositive ? '+' : ''}{formatPrice(Math.abs(priceChange))}
        </div>
      )}
      {/* Mobile: Expand/collapse details */}
      <button
        className="md:hidden btn btn-secondary text-xs flex items-center gap-1 mt-2"
        title={showStatsMobile ? 'Hide Details' : 'Show Details'}
        onClick={() => setShowStatsMobile(v => !v)}
      >
        {showStatsMobile ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        <span>{showStatsMobile ? 'Hide' : 'Details'}</span>
      </button>
      {/* Progressive Disclosure: Details on hover/expand */}
      <div
        className={`transition-all duration-200 overflow-hidden ${showDetails ? 'max-h-[1000px] opacity-100 mt-2' : 'max-h-0 opacity-0 pointer-events-none'} md:static absolute left-0 w-full`}
        style={{ zIndex: 20 }}
      >
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4 mt-2 md:mt-0">
          {/* Category & NAV Date */}
          <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
            {showCategory && (
              <div>
                <span className="text-gray-500">Category:</span>
                <span className="ml-1 font-medium text-gray-900">{data?.category}</span>
              </div>
            )}
            {showNavDate && (
              <div>
                <span className="text-gray-500">{liveMode ? 'Last Update:' : 'NAV Date:'}</span>
                <span className="ml-1 font-medium text-gray-900">{liveMode ? 'Live' : (data?.navDate || etf?.navDate || 'N/A')}</span>
              </div>
            )}
          </div>
          {/* Live Mode Performance Summary */}
          {liveMode && (yearlyChange !== undefined || monthlyChange !== undefined) && (
            <div className="mb-2 p-2 bg-gray-50 rounded-lg">
              <div className="text-xs font-medium text-gray-700 mb-1">Performance</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {yearlyChange !== undefined && (
                  <div>
                    <span className="text-gray-500">1Y:</span>
                    <span className={`ml-1 font-medium ${yearlyChange >= 0 ? 'text-success-600' : 'text-danger-600'}`}>{yearlyChange >= 0 ? '+' : ''}{formatPercent(yearlyChange)}</span>
                  </div>
                )}
                {monthlyChange !== undefined && (
                  <div>
                    <span className="text-gray-500">1M:</span>
                    <span className={`ml-1 font-medium ${monthlyChange >= 0 ? 'text-success-600' : 'text-danger-600'}`}>{monthlyChange >= 0 ? '+' : ''}{formatPercent(monthlyChange)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Live Mode Additional Info */}
          {liveMode && (
            <div className="mt-1 space-y-1 text-xs">
              {openPrice && <div className="text-gray-500">Open: {formatPrice(openPrice)}</div>}
              {dailyHigh && dailyLow && <div className="text-gray-500">H: {formatPrice(dailyHigh)} | L: {formatPrice(dailyLow)}</div>}
              {volume && <div className="text-gray-500">Vol: {formatVolume(volume)}</div>}
            </div>
          )}
          {/* 52-Week Stats */}
          <div className="mt-2">
            <ETF52WeekStats etf={etf} liveData={liveData} />
          </div>
          {/* Action Icons */}
          <div className="flex gap-2 mt-4 pt-2 border-t border-gray-100 justify-end">
            <button className="btn btn-secondary text-sm" title="View Details">
              <Eye className="w-5 h-5" />
            </button>
            <button className={`btn btn-secondary text-sm ${selected ? 'bg-primary-100 text-primary-700' : ''}`} title="Compare" onClick={onToggleSelect}>
              <CheckSquare className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
