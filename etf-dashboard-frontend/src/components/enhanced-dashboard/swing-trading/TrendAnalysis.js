import React, { useMemo } from 'react';

/**
 * TrendAnalysis - Analyzes and displays market trend direction and strength
 */
export default function TrendAnalysis({ data, loading }) {
  const trendMemo = useMemo(() => {
    // Calculate various trend indicators

    // 1. Moving averages
    const calcMovingAverage = (prices, period) => {
      const result = [];
      for (let i = 0; i < prices.length; i++) {
        if (i < period - 1) {
          result.push(null);
        } else {
          let sum = 0;
          for (let j = 0; j < period; j++) {
            sum += prices[i - j].close;
          }
          result.push(sum / period);
        }
      }
      return result;
    };

    const ma20 = calcMovingAverage(data, 20);
    const ma50 = calcMovingAverage(data, 50);

    // 2. Determine primary trend direction
    const latestMA20 = ma20[ma20.length - 1];
    const latestMA50 = ma50[ma50.length - 1];
    const prev5MA20 = ma20[ma20.length - 6];
    const prev5MA50 = ma50[ma50.length - 6];

    const ma20Slope = latestMA20 && prev5MA20 ? (latestMA20 - prev5MA20) / prev5MA20 * 100 : 0;
    const ma50Slope = latestMA50 && prev5MA50 ? (latestMA50 - prev5MA50) / prev5MA50 * 100 : 0;

    let primaryTrend = 'Neutral';
    if (latestMA20 > latestMA50 && ma20Slope > 0) {
      primaryTrend = 'Uptrend';
    } else if (latestMA20 < latestMA50 && ma20Slope < 0) {
      primaryTrend = 'Downtrend';
    } else if (Math.abs(latestMA20 - latestMA50) / latestMA50 < 0.01) {
      primaryTrend = 'Consolidation';
    }

    // 3. Higher highs and lower lows analysis (last 20 days)
    const recentData = data.slice(-20);
    let higherHighs = 0;
    let lowerLows = 0;

    for (let i = 5; i < recentData.length; i++) {
      const prevHigh = Math.max(...recentData.slice(i-5, i).map(d => d.high));
      const prevLow = Math.min(...recentData.slice(i-5, i).map(d => d.low));

      if (recentData[i].high > prevHigh) higherHighs++;
      if (recentData[i].low < prevLow) lowerLows++;
    }

    // 4. Calculate trend strength (0-100)
    let trendStrength = 50; // neutral starting point

    // Add/subtract points based on trend factors
    trendStrength += ma20Slope * 5; // MA slope contribution
    trendStrength += (higherHighs - lowerLows) * 2; // HH/LL contribution
    trendStrength += latestMA20 > latestMA50 ? 10 : latestMA20 < latestMA50 ? -10 : 0; // MA position

    // Constrain to 0-100 range
    trendStrength = Math.min(100, Math.max(0, trendStrength));

    // 5. Determine trend phase
    let trendPhase = 'Neutral';
    if (trendStrength >= 75) {
      trendPhase = primaryTrend === 'Uptrend' ? 'Strong Uptrend' : 'Strong Downtrend';
    } else if (trendStrength >= 60) {
      trendPhase = primaryTrend === 'Uptrend' ? 'Moderate Uptrend' : 'Moderate Downtrend';
    } else if (trendStrength <= 25) {
      trendPhase = 'Weak Trend / Ranging';
    } else if (trendStrength <= 40) {
      trendPhase = 'Early ' + primaryTrend;
    } else {
      trendPhase = 'Neutral / Undefined';
    }

    // 6. Calculate price vs moving averages
    const latestPrice = data[data.length - 1].close;
    const priceVsMA20 = ((latestPrice / latestMA20) - 1) * 100;
    const priceVsMA50 = ((latestPrice / latestMA50) - 1) * 100;

    // 7. Generate trend insights
    const insights = generateTrendInsight(primaryTrend, trendStrength, priceVsMA20, priceVsMA50, higherHighs, lowerLows);

    return {
      primaryTrend,
      trendStrength: Math.round(trendStrength),
      trendPhase,
      ma20Slope: ma20Slope.toFixed(2),
      ma50Slope: ma50Slope.toFixed(2),
      higherHighs,
      lowerLows,
      priceVsMA20: priceVsMA20.toFixed(2),
      priceVsMA50: priceVsMA50.toFixed(2),
      insights
    };
  }, [data, loading]);

  if (loading) {
    return <div className="loading-indicator">Loading trend analysis...</div>;
  }

  if (!data || data.length < 10) {
    return (
      <div className="trend-analysis-container">
        <h3 className="section-title">Trend Analysis</h3>
        <div className="no-data">Insufficient data for trend analysis</div>
      </div>
    );
  }

  // Get color class based on trend
  const getTrendClass = (trend) => {
    if (trend.includes('Uptrend') || trend === 'Uptrend') return 'trend-bullish';
    if (trend.includes('Downtrend') || trend === 'Downtrend') return 'trend-bearish';
    return 'trend-neutral';
  };

  // Get class for trend strength
  const getStrengthClass = (strength) => {
    if (strength >= 75) return 'strength-very-strong';
    if (strength >= 60) return 'strength-strong';
    if (strength <= 25) return 'strength-very-weak';
    if (strength <= 40) return 'strength-weak';
    return 'strength-neutral';
  };

  // Get class for MA slope
  const getSlopeClass = (slope) => {
    const slopeNum = parseFloat(slope);
    if (slopeNum > 0.5) return 'slope-strong-up';
    if (slopeNum > 0) return 'slope-up';
    if (slopeNum < -0.5) return 'slope-strong-down';
    if (slopeNum < 0) return 'slope-down';
    return 'slope-flat';
  };

  return (
    <div className="trend-analysis-container">
      <h3 className="section-title">Trend Analysis</h3>

      <div className="trend-main">
        <div className={`trend-direction ${getTrendClass(trendMemo.primaryTrend)}`}>
          {trendMemo.primaryTrend}
        </div>
        <div className="trend-strength-container">
          <div className="strength-label">Strength:</div>
          <div className="strength-bar-container">
            <div
              className={`strength-bar ${getStrengthClass(trendMemo.trendStrength)}`}
              style={{ width: `${trendMemo.trendStrength}%` }}
            ></div>
          </div>
          <div className="strength-value">{trendMemo.trendStrength}%</div>
        </div>
        <div className={`trend-phase ${getTrendClass(trendMemo.trendPhase)}`}>
          {trendMemo.trendPhase}
        </div>
      </div>

      <div className="trend-details">
        <div className="trend-metric">
          <div className="metric-label">MA20 Slope:</div>
          <div className={`metric-value ${getSlopeClass(trendMemo.ma20Slope)}`}>
            {trendMemo.ma20Slope > 0 ? '+' : ''}{trendMemo.ma20Slope}%
          </div>
        </div>
        <div className="trend-metric">
          <div className="metric-label">MA50 Slope:</div>
          <div className={`metric-value ${getSlopeClass(trendMemo.ma50Slope)}`}>
            {trendMemo.ma50Slope > 0 ? '+' : ''}{trendMemo.ma50Slope}%
          </div>
        </div>
        <div className="trend-metric">
          <div className="metric-label">Higher Highs:</div>
          <div className="metric-value">{trendMemo.higherHighs}</div>
        </div>
        <div className="trend-metric">
          <div className="metric-label">Lower Lows:</div>
          <div className="metric-value">{trendMemo.lowerLows}</div>
        </div>
      </div>

      <div className="price-ma-relationship">
        <div className="relationship-title">Price vs Moving Averages</div>
        <div className="relationship-metrics">
          <div className="ma-metric">
            <span className="ma-label">Price vs MA20:</span>
            <span className={`ma-value ${parseFloat(trendMemo.priceVsMA20) > 0 ? 'positive' : 'negative'}`}>
              {trendMemo.priceVsMA20 > 0 ? '+' : ''}{trendMemo.priceVsMA20}%
            </span>
          </div>
          <div className="ma-metric">
            <span className="ma-label">Price vs MA50:</span>
            <span className={`ma-value ${parseFloat(trendMemo.priceVsMA50) > 0 ? 'positive' : 'negative'}`}>
              {trendMemo.priceVsMA50 > 0 ? '+' : ''}{trendMemo.priceVsMA50}%
            </span>
          </div>
        </div>
      </div>

      <div className="trend-insights">
        <div className="insight-title">Trend Insights</div>
        <div className="insight-text">
          {trendMemo.insights}
        </div>
      </div>
    </div>
  );
}

// Helper function to generate insights based on trend metrics
function generateTrendInsight(trend, strength, priceVsMA20, priceVsMA50, higherHighs, lowerLows) {
  const priceMA20 = parseFloat(priceVsMA20);
  const priceMA50 = parseFloat(priceVsMA50);

  if (trend === 'Uptrend' && strength >= 75) {
    return "Strong uptrend in progress. This ETF is showing consistent upward momentum with strong trend metrics. Consider buying pullbacks to moving averages.";
  }

  if (trend === 'Uptrend' && priceMA20 < -2) {
    return "Price is pulling back within an uptrend. This may present a potential buying opportunity if support holds.";
  }

  if (trend === 'Uptrend' && priceMA20 > 5) {
    return "Price is extended well above its moving averages in an uptrend. Consider waiting for a pullback before entering new positions.";
  }

  if (trend === 'Downtrend' && strength >= 75) {
    return "Strong downtrend in progress. This ETF is showing consistent downward momentum. Consider staying on the sidelines or implementing hedging strategies.";
  }

  if (trend === 'Downtrend' && priceMA20 > 2) {
    return "Price is experiencing a relief rally within a downtrend. These counter-trend moves often present high-risk selling opportunities.";
  }

  if (trend === 'Consolidation') {
    return "Price is consolidating in a sideways range. Look for a breakout above resistance or breakdown below support for potential new trend directions.";
  }

  if (higherHighs > lowerLows + 3) {
    return "Price is making consistent higher highs, a bullish signal suggesting continued upward momentum.";
  }

  if (lowerLows > higherHighs + 3) {
    return "Price is making consistent lower lows, a bearish signal suggesting continued downward pressure.";
  }

  if (Math.abs(priceMA50) < 1 && Math.abs(priceMA20) < 1) {
    return "Price is trading very close to key moving averages, suggesting a potential decision point for the next market direction.";
  }

  return "Monitor price action closely in relation to key moving averages and previous swing highs/lows to determine potential trend changes.";
}
