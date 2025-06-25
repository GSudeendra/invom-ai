import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * VolumeAnalysis - Analyzes trading volume patterns to identify potential price movements
 */
export default function VolumeAnalysis({ data, loading }) {
  const volumeMemo = useMemo(() => {
    if (loading) {
      return <div className="loading-indicator">Loading volume analysis...</div>;
    }

    if (!data || data.length === 0) {
      return (
        <div className="volume-analysis-container">
          <h3 className="section-title">Volume Analysis</h3>
          <div className="no-data">No volume data available</div>
        </div>
      );
    }

    // Process volume data for analysis
    const recentData = data.slice(-30);

    // Calculate average volume
    const totalVolume = recentData.reduce((sum, item) => sum + (item.volume || 0), 0);
    const avgVolume = totalVolume / recentData.length;

    // Calculate anomalies and trends
    let volumeSpikes = 0;
    let volumeDips = 0;
    let risingVolume = 0;
    let fallingVolume = 0;
    let priceVolumeConvergence = 0;
    let priceVolumeDivergence = 0;

    // Process each day
    for (let i = 1; i < recentData.length; i++) {
      const current = recentData[i];
      const prev = recentData[i-1];

      // Check for volume spikes (50% above average)
      if (current.volume > avgVolume * 1.5) volumeSpikes++;

      // Check for volume dips (50% below average)
      if (current.volume < avgVolume * 0.5) volumeDips++;

      // Check for rising/falling volume trend
      if (current.volume > prev.volume) risingVolume++;
      if (current.volume < prev.volume) fallingVolume++;

      // Check price/volume relationships
      const priceUp = current.close > prev.close;
      const volumeUp = current.volume > prev.volume;

      // Convergence: price and volume move in same direction
      if ((priceUp && volumeUp) || (!priceUp && !volumeUp)) priceVolumeConvergence++;

      // Divergence: price and volume move in opposite directions
      if ((priceUp && !volumeUp) || (!priceUp && volumeUp)) priceVolumeDivergence++;
    }

    // Get volume trend for most recent 5 days
    const recentTrend = recentData.slice(-5).reduce((count, item, i, arr) => {
      if (i === 0) return count;
      return count + (item.volume > arr[i-1].volume ? 1 : -1);
    }, 0);

    // Most recent day volume vs average
    const latestVolume = recentData[recentData.length - 1].volume;
    const volVsAvg = ((latestVolume / avgVolume) - 1) * 100; // percentage

    // Return processed data
    return {
      chartData: recentData.map((item, index) => ({
        date: item.date,
        volume: item.volume,
        avgVolume,
        priceChange: index > 0 ? (item.close - recentData[index-1].close) : 0,
      })),
      metrics: {
        avgVolume: Math.round(avgVolume),
        latestVolume: Math.round(latestVolume),
        volVsAvg: volVsAvg.toFixed(1),
        volumeSpikes,
        volumeDips,
        recentTrend: recentTrend > 0 ? 'Increasing' : recentTrend < 0 ? 'Decreasing' : 'Neutral',
        priceVolumeConvergence,
        priceVolumeDivergence,
        insight: generateVolumeInsight(volVsAvg, recentTrend, priceVolumeConvergence, priceVolumeDivergence)
      }
    };
  }, [data, loading]);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data</div>;

  // Format date for tooltip display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format large volume numbers
  const formatVolume = (volume) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(2)}M`;
    }
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(2)}K`;
    }
    return volume;
  };

  // Get color class based on volume vs average
  const getVolumeClass = (volVsAvg) => {
    if (volVsAvg > 25) return 'volume-very-high';
    if (volVsAvg > 0) return 'volume-high';
    if (volVsAvg < -25) return 'volume-very-low';
    if (volVsAvg < 0) return 'volume-low';
    return 'volume-neutral';
  };

  return (
    <div className="volume-analysis-container">
      <h3 className="section-title">Volume Analysis</h3>

      <div className="volume-metrics">
        <div className="metric-row">
          <div className="volume-metric">
            <span className="metric-label">Today's Volume:</span>
            <span className={`metric-value ${getVolumeClass(volumeMemo.metrics.volVsAvg)}`}>
              {formatVolume(volumeMemo.metrics.latestVolume)}
            </span>
          </div>
          <div className="volume-metric">
            <span className="metric-label">Avg Volume:</span>
            <span className="metric-value">
              {formatVolume(volumeMemo.metrics.avgVolume)}
            </span>
          </div>
          <div className="volume-metric">
            <span className="metric-label">vs Average:</span>
            <span className={`metric-value ${getVolumeClass(volumeMemo.metrics.volVsAvg)}`}>
              {volumeMemo.metrics.volVsAvg > 0 ? '+' : ''}
              {volumeMemo.metrics.volVsAvg}%
            </span>
          </div>
        </div>

        <div className="metric-row">
          <div className="volume-metric">
            <span className="metric-label">Recent Trend:</span>
            <span className={`metric-value ${volumeMemo.metrics.recentTrend === 'Increasing' ? 'volume-high' : 
                               volumeMemo.metrics.recentTrend === 'Decreasing' ? 'volume-low' : 'volume-neutral'}`}>
              {volumeMemo.metrics.recentTrend}
            </span>
          </div>
          <div className="volume-metric">
            <span className="metric-label">Volume Spikes:</span>
            <span className="metric-value">{volumeMemo.metrics.volumeSpikes}</span>
          </div>
        </div>
      </div>

      <div className="volume-chart">
        <ResponsiveContainer width="100%" height={150}>
          <BarChart
            data={volumeMemo.chartData}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              tickFormatter={formatDate}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10 }}
              tickFormatter={formatVolume}
              axisLine={false}
            />
            <Tooltip
              formatter={(value) => [formatVolume(value), 'Volume']}
              labelFormatter={(label) => `Date: ${formatDate(label)}`}
            />
            <Bar
              dataKey="volume"
              fill="#8884d8"
              name="Volume"
              animationDuration={1000}
            />
            <Bar
              dataKey="avgVolume"
              fill="#82ca9d"
              name="Avg Volume"
              animationDuration={1000}
              opacity={0.3}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="volume-insight">
        <div className="insight-title">Volume Insight</div>
        <div className="insight-text">
          {volumeMemo.metrics.insight}
        </div>
      </div>
    </div>
  );
}

// Helper function to generate insights based on volume metrics
function generateVolumeInsight(volVsAvg, recentTrend, convergence, divergence) {
  const volVsAvgNum = parseFloat(volVsAvg);

  if (volVsAvgNum > 50 && recentTrend === 'Increasing') {
    return "Unusually high and increasing volume suggests strong buying/selling pressure that could accelerate the current price trend. Watch for potential continuation or exhaustion.";
  }

  if (volVsAvgNum > 25) {
    return "Above average volume indicates increased interest in this ETF. Higher volume typically confirms price moves and makes them more reliable.";
  }

  if (volVsAvgNum < -25 && recentTrend === 'Decreasing') {
    return "Volume is significantly below average and declining, suggesting decreasing interest in this ETF. Price moves on low volume are generally less reliable.";
  }

  if (convergence > divergence) {
    return "Price and volume are generally moving in the same direction (convergence), which is considered a healthy market behavior that confirms the price trend.";
  }

  if (divergence > convergence) {
    return "Price and volume are often moving in opposite directions (divergence), which may indicate weakness in the current price trend and potential for reversal.";
  }

  return "Volume is near average levels. Look for significant volume changes that coincide with price movements to identify potential trading opportunities.";
}
