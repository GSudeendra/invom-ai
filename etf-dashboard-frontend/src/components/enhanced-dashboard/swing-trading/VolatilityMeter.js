import React, { useMemo } from 'react';

/**
 * VolatilityMeter - Measures and displays market volatility metrics
 */
export default function VolatilityMeter({ data, loading }) {
  const volatilityMemo = useMemo(() => {
    // Calculate Average True Range (ATR)
    const calculateATR = (data, period = 14) => {
      let trueRanges = [];

      // Calculate True Range for each bar
      for (let i = 1; i < data.length; i++) {
        const high = data[i].high;
        const low = data[i].low;
        const prevClose = data[i-1].close;

        // True Range is the greatest of:
        // 1. Current High - Current Low
        // 2. Current High - Previous Close (absolute value)
        // 3. Current Low - Previous Close (absolute value)
        const tr1 = high - low;
        const tr2 = Math.abs(high - prevClose);
        const tr3 = Math.abs(low - prevClose);

        const trueRange = Math.max(tr1, tr2, tr3);
        trueRanges.push(trueRange);
      }

      // Calculate ATR (simple moving average of true ranges)
      let atrs = [];
      let sum = 0;

      for (let i = 0; i < trueRanges.length; i++) {
        sum += trueRanges[i];

        if (i < period - 1) {
          atrs.push(null);
        } else {
          if (i > period - 1) {
            sum -= trueRanges[i - period];
          }
          atrs.push(sum / period);
        }
      }

      return atrs;
    };

    // Calculate ATR values
    const atrs = calculateATR(data);
    const currentATR = atrs[atrs.length - 1];

    // Calculate ATR as percentage of price
    const currentPrice = data[data.length - 1].close;
    const atrPercent = (currentATR / currentPrice) * 100;

    // Calculate daily price ranges for last 20 days
    const recentData = data.slice(-20);
    const dailyRanges = recentData.map(day => ((day.high - day.low) / day.low) * 100);
    const avgDailyRange = dailyRanges.reduce((sum, range) => sum + range, 0) / dailyRanges.length;

    // Calculate Bollinger Band width
    const calculateBBWidth = () => {
      const period = 20;
      const stdDevMultiplier = 2;

      // Not enough data
      if (data.length < period) return null;

      // Get last 'period' of closing prices
      const closes = data.slice(-period).map(item => item.close);

      // Calculate simple moving average
      const sma = closes.reduce((sum, price) => sum + price, 0) / period;

      // Calculate standard deviation
      const squaredDifferences = closes.map(price => Math.pow(price - sma, 2));
      const variance = squaredDifferences.reduce((sum, val) => sum + val, 0) / period;
      const stdDev = Math.sqrt(variance);

      // Calculate Bollinger Band width
      const upperBand = sma + (stdDevMultiplier * stdDev);
      const lowerBand = sma - (stdDevMultiplier * stdDev);

      return ((upperBand - lowerBand) / sma) * 100;
    };

    const bbWidth = calculateBBWidth();

    // Calculate historical volatility (standard deviation of returns)
    const calculateHistoricalVolatility = () => {
      const period = 20;

      // Calculate logarithmic returns
      const returns = [];
      for (let i = 1; i < data.length; i++) {
        returns.push(Math.log(data[i].close / data[i-1].close));
      }

      // Get most recent period of returns
      const recentReturns = returns.slice(-period);

      // Calculate mean
      const mean = recentReturns.reduce((sum, ret) => sum + ret, 0) / period;

      // Calculate standard deviation
      const squaredDiffs = recentReturns.map(ret => Math.pow(ret - mean, 2));
      const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / period;
      const stdDev = Math.sqrt(variance);

      // Annualize (multiply by square root of 252 trading days)
      return stdDev * Math.sqrt(252) * 100;
    };

    const historicalVolatility = calculateHistoricalVolatility();

    // Determine volatility level
    let volatilityLevel;
    if (atrPercent < 1) volatilityLevel = 'Very Low';
    else if (atrPercent < 1.5) volatilityLevel = 'Low';
    else if (atrPercent < 2.5) volatilityLevel = 'Moderate';
    else if (atrPercent < 4) volatilityLevel = 'High';
    else volatilityLevel = 'Very High';

    // Determine volatility trend
    const recentATRs = atrs.slice(-10).filter(atr => atr !== null);
    const firstATR = recentATRs[0];
    const lastATR = recentATRs[recentATRs.length - 1];

    let volatilityTrend;
    if (lastATR > firstATR * 1.2) volatilityTrend = 'Rising Quickly';
    else if (lastATR > firstATR * 1.05) volatilityTrend = 'Rising';
    else if (lastATR < firstATR * 0.8) volatilityTrend = 'Falling Quickly';
    else if (lastATR < firstATR * 0.95) volatilityTrend = 'Falling';
    else volatilityTrend = 'Stable';

    // Calculate volatility percentile rank (0-100)
    // This tells how current volatility compares to recent history
    const volatilityPercentile = (() => {
      // Get ATRs from last 60 days
      const recentATRs = atrs.slice(-60).filter(atr => atr !== null);
      if (recentATRs.length < 10) return 50; // Not enough data

      // Sort from lowest to highest
      const sortedATRs = [...recentATRs].sort((a, b) => a - b);

      // Find rank of current ATR
      const rank = sortedATRs.findIndex(atr => atr >= currentATR);

      // Convert to percentile
      return Math.round((rank / sortedATRs.length) * 100);
    })();

    // Generate volatility insights
    const insights = generateVolatilityInsight(
      volatilityLevel,
      volatilityTrend,
      volatilityPercentile,
      atrPercent
    );

    return {
      atr: currentATR.toFixed(2),
      atrPercent: atrPercent.toFixed(2),
      avgDailyRange: avgDailyRange.toFixed(2),
      bbWidth: bbWidth ? bbWidth.toFixed(2) : 'N/A',
      historicalVolatility: historicalVolatility.toFixed(2),
      volatilityLevel,
      volatilityTrend,
      volatilityPercentile,
      insights
    };
  }, [data, loading]);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data</div>;

  // Get class for volatility level
  const getVolatilityClass = (level) => {
    switch (level) {
      case 'Very Low': return 'vol-very-low';
      case 'Low': return 'vol-low';
      case 'Moderate': return 'vol-moderate';
      case 'High': return 'vol-high';
      case 'Very High': return 'vol-very-high';
      default: return 'vol-moderate';
    }
  };

  // Get class for volatility trend
  const getTrendClass = (trend) => {
    if (trend.includes('Quickly')) {
      return trend.includes('Rising') ? 'trend-strong-up' : 'trend-strong-down';
    }
    if (trend === 'Rising') return 'trend-up';
    if (trend === 'Falling') return 'trend-down';
    return 'trend-neutral';
  };

  return (
    <div className="volatility-meter-container">
      <h3 className="section-title">Volatility Meter</h3>

      <div className="volatility-main">
        <div className={`volatility-level ${getVolatilityClass(volatilityMemo.volatilityLevel)}`}>
          {volatilityMemo.volatilityLevel}
        </div>
        <div className="volatility-gauge">
          <div className="gauge-scale">
            <div className="gauge-marker" style={{ left: `${volatilityMemo.volatilityPercentile}%` }}></div>
            <div className="gauge-zones">
              <div className="zone low-zone" title="Low Volatility"></div>
              <div className="zone normal-zone" title="Normal Volatility"></div>
              <div className="zone high-zone" title="High Volatility"></div>
            </div>
          </div>
          <div className="gauge-labels">
            <span>Low</span>
            <span>Normal</span>
            <span>High</span>
          </div>
        </div>
        <div className={`volatility-trend ${getTrendClass(volatilityMemo.volatilityTrend)}`}>
          {volatilityMemo.volatilityTrend}
        </div>
      </div>

      <div className="volatility-metrics">
        <div className="metric-row">
          <div className="vol-metric">
            <span className="metric-label">ATR:</span>
            <span className="metric-value">₹{volatilityMemo.atr}</span>
          </div>
          <div className="vol-metric">
            <span className="metric-label">ATR %:</span>
            <span className="metric-value">{volatilityMemo.atrPercent}%</span>
          </div>
          <div className="vol-metric">
            <span className="metric-label">Avg Daily Range:</span>
            <span className="metric-value">{volatilityMemo.avgDailyRange}%</span>
          </div>
        </div>
        <div className="metric-row">
          <div className="vol-metric">
            <span className="metric-label">BB Width:</span>
            <span className="metric-value">{volatilityMemo.bbWidth}%</span>
          </div>
          <div className="vol-metric">
            <span className="metric-label">Historical Vol:</span>
            <span className="metric-value">{volatilityMemo.historicalVolatility}%</span>
          </div>
          <div className="vol-metric">
            <span className="metric-label">Percentile:</span>
            <span className="metric-value">{volatilityMemo.volatilityPercentile}th</span>
          </div>
        </div>
      </div>

      <div className="volatility-insight">
        <div className="insight-title">Volatility Insight</div>
        <div className="insight-text">
          {volatilityMemo.insights}
        </div>
      </div>
    </div>
  );
}

// Helper function to generate insights based on volatility metrics
function generateVolatilityInsight(level, trend, percentile, atrPercent) {
  if (level === 'Very High' && trend.includes('Rising')) {
    return "Volatility is extremely high and increasing, suggesting potential price climax or reversal. Consider reducing position size and using wider stops for any new trades.";
  }

  if (level === 'High' || level === 'Very High') {
    return "High volatility indicates increased risk but also greater profit potential. Swing traders should consider smaller position sizes and expect larger price swings.";
  }

  if (level === 'Low' && trend.includes('Falling')) {
    return "Volatility is contracting to unusually low levels, which often precedes a significant price move. Be prepared for a potential volatility breakout soon.";
  }

  if (level === 'Low' || level === 'Very Low') {
    return "Low volatility periods are typically favorable for position building. However, be aware that extended periods of low volatility often lead to explosive moves.";
  }

  if (trend === 'Rising Quickly' && percentile < 50) {
    return "Volatility is rapidly increasing from a low base, which often signals the start of a new trend. Consider implementing breakout strategies.";
  }

  if (trend === 'Falling Quickly' && percentile > 70) {
    return "Volatility is rapidly decreasing from elevated levels, which may indicate diminishing momentum. The market may be transitioning to a more directional phase.";
  }

  if (percentile > 80) {
    return "Volatility is in the top 20% of its recent range. This extreme level rarely persists for long. Expect a reversion to more normal levels soon.";
  }

  if (percentile < 20) {
    return "Volatility is in the bottom 20% of its recent range. Historically low volatility often precedes significant market moves. Stay alert for breakouts.";
  }

  return "Volatility is at moderate levels. Current price movements are consistent with historical norms. Standard position sizing and risk management rules apply.";
}
