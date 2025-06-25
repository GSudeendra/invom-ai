import React from 'react';
import { Sparklines, SparklinesCurve } from 'react-sparklines';
import { formatPrice, formatPercent, formatDate } from '../../utils/format';

const ETFDetailView = ({ etf, live = false }) => {
  if (!etf) return null;

  const getPerformanceColor = (value) => {
    const num = Number(value);
    return num > 0 ? 'text-green-600' : num < 0 ? 'text-red-600' : 'text-gray-600';
  };

  const getRSIColor = (rsi) => {
    if (rsi >= 70) return 'text-red-600';
    if (rsi <= 30) return 'text-green-600';
    return 'text-yellow-600';
  };

  const getVolatilityColor = (tag) => {
    switch (tag) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="etf-detail-view">
      {/* Header Section */}
      <div className="detail-header mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {live ? etf.symbol : etf.schemeName || etf.symbol}
            </h2>
            <p className="text-gray-600 font-mono text-sm">
              {live ? etf.assets : etf.symbol}
            </p>
          </div>
          {live && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              Live
            </span>
          )}
        </div>
      </div>

      {/* Price and Performance Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Price</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">NAV:</span>
              <span className="font-bold text-xl">
                {live 
                  ? (etf.ltP ? `₹${etf.ltP}` : 'N/A')
                  : formatPrice(etf.latestNav)
                }
              </span>
            </div>
            {live && etf.per && (
              <div className="flex justify-between">
                <span className="text-gray-600">Change:</span>
                <span className={`font-semibold ${getPerformanceColor(etf.per)}`}>
                  {Number(etf.per) > 0 ? '+' : ''}{etf.per}%
                </span>
              </div>
            )}
            {!live && etf.navDate && (
              <div className="flex justify-between">
                <span className="text-gray-600">As of:</span>
                <span className="text-sm text-gray-500">{formatDate(etf.navDate)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance</h3>
          <div className="space-y-2">
            {!live && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">1D Change:</span>
                  <span className={`font-semibold ${getPerformanceColor(etf.dailyChangePercent)}`}>
                    {formatPercent(etf.dailyChangePercent)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">5D Change:</span>
                  <span className={`font-semibold ${getPerformanceColor(etf.weeklyChangePercent)}`}>
                    {formatPercent(etf.weeklyChangePercent)}
                  </span>
                </div>
              </>
            )}
            {live && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">52W High:</span>
                  <span className="font-semibold">
                    {etf.wkhi ? `₹${etf.wkhi}` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">52W Low:</span>
                  <span className="font-semibold">
                    {etf.wklo ? `₹${etf.wklo}` : 'N/A'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Technical Indicators Section */}
      {!live && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Technical Indicators</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {etf.rsi && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">RSI:</span>
                  <span className={`font-semibold ${getRSIColor(etf.rsi)}`}>
                    {etf.rsi}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(etf.rsi, 100)}%`,
                      backgroundColor: etf.rsi >= 70 ? '#EF4444' : etf.rsi <= 30 ? '#10B981' : '#F59E0B'
                    }}
                  />
                </div>
              </div>
            )}
            
            {etf.smaCrossover && (
              <div>
                <span className="text-gray-600">SMA Crossover:</span>
                <span className={`ml-2 font-semibold ${
                  etf.smaCrossover === 'bullish' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {etf.smaCrossover === 'bullish' ? '📈 Bullish' : '📉 Bearish'}
                </span>
              </div>
            )}
            
            {etf.volatility && (
              <div>
                <span className="text-gray-600">Volatility:</span>
                <span className={`ml-2 font-semibold ${getVolatilityColor(etf.volatilityTag)}`}>
                  {etf.volatility}% ({etf.volatilityTag})
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chart Section */}
      {etf.historicalPrices && etf.historicalPrices.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Price Trend</h3>
          <div className="h-32">
            <Sparklines data={etf.historicalPrices} width={400} height={120} margin={5}>
              <SparklinesCurve style={{ fill: "none", stroke: "#3b82f6", strokeWidth: 2 }} />
            </Sparklines>
          </div>
        </div>
      )}

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Fund Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Category:</span>
              <span className="font-medium">{live ? etf.assets : etf.category}</span>
            </div>
            {etf.fundHouse && (
              <div className="flex justify-between">
                <span className="text-gray-600">Fund House:</span>
                <span className="font-medium">{etf.fundHouse}</span>
              </div>
            )}
            {etf.amfiCode && (
              <div className="flex justify-between">
                <span className="text-gray-600">AMFI Code:</span>
                <span className="font-mono">{etf.amfiCode}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Trading Info</h3>
          <div className="space-y-2 text-sm">
            {etf.volume && (
              <div className="flex justify-between">
                <span className="text-gray-600">Volume:</span>
                <span className="font-medium">{Number(etf.volume).toLocaleString()}</span>
              </div>
            )}
            {etf.marketCap && (
              <div className="flex justify-between">
                <span className="text-gray-600">Market Cap:</span>
                <span className="font-medium">{formatPrice(etf.marketCap)}</span>
              </div>
            )}
            {etf.expenseRatio && (
              <div className="flex justify-between">
                <span className="text-gray-600">Expense Ratio:</span>
                <span className="font-medium">{etf.expenseRatio}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ETFDetailView; 