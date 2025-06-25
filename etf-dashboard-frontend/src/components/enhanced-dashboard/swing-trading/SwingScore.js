import React, { useMemo } from 'react';

/**
 * SwingScore - Calculates and displays overall swing trading potential score
 */
export default function SwingScore({ etf, data, signals, loading }) {
  // Calculate swing trading score - moved before any returns
  const scoreData = useMemo(() => {
    if (!data || data.length < 10 || !etf) {
      return null;
    }

    // Each factor contributes to the overall swing score
    const scoreFactors = {};
    let totalScore = 50; // Neutral starting point
    
    // 1. Trend factor (0-25 points)
    const getTrendScore = () => {
      const recentData = data.slice(-50);
      if (recentData.length < 20) return { score: 12.5, explanation: "Neutral trend (insufficient data)" };
      
      // Calculate short and medium term moving averages
      const calcMA = (period) => {
        const prices = recentData.map(d => d.close);
        const ma = [];
        
        for (let i = 0; i < prices.length; i++) {
          if (i < period - 1) {
            ma.push(null);
          } else {
            let sum = 0;
            for (let j = 0; j < period; j++) {
              sum += prices[i - j];
            }
            ma.push(sum / period);
          }
        }
        
        return ma;
      };
      
      const ma10 = calcMA(10);
      const ma20 = calcMA(20);
      const ma50 = calcMA(50);
      
      // Get most recent values
      const last10MA = ma10[ma10.length - 1];
      const last20MA = ma20[ma20.length - 1];
      const last50MA = ma50[ma50.length - 1];
      
      // Calculate trend scores
      let trendScore = 12.5; // Neutral starting point
      let explanation = "Neutral trend";
      
      // Strong uptrend: MA10 > MA20 > MA50
      if (last10MA > last20MA && last20MA > last50MA) {
        trendScore = 22;
        explanation = "Strong uptrend: All moving averages aligned bullishly";
      }
      // Strong downtrend: MA10 < MA20 < MA50
      else if (last10MA < last20MA && last20MA < last50MA) {
        trendScore = 5;
        explanation = "Strong downtrend: All moving averages aligned bearishly";
      }
      // Early uptrend: MA10 > MA20 but MA20 < MA50
      else if (last10MA > last20MA && last20MA < last50MA) {
        trendScore = 18;
        explanation = "Early uptrend: Short-term bullish momentum";
      }
      // Early downtrend: MA10 < MA20 but MA20 > MA50
      else if (last10MA < last20MA && last20MA > last50MA) {
        trendScore = 8;
        explanation = "Early downtrend: Short-term bearish momentum";
      }
      // Sideways but slightly bullish: All MAs close together with positive slope
      else if (Math.abs(last10MA - last50MA) / last50MA < 0.02 && last10MA > last50MA) {
        trendScore = 15;
        explanation = "Sideways-to-bullish: Consolidation with slight bullish bias";
      }
      // Sideways but slightly bearish: All MAs close together with negative slope
      else if (Math.abs(last10MA - last50MA) / last50MA < 0.02 && last10MA < last50MA) {
        trendScore = 10;
        explanation = "Sideways-to-bearish: Consolidation with slight bearish bias";
      }
      
      return { score: trendScore, explanation };
    };
    
    // 2. Volatility factor (0-20 points)
    const getVolatilityScore = () => {
      const recentData = data.slice(-20);
      if (recentData.length < 5) return { score: 10, explanation: "Average volatility (insufficient data)" };
      
      // Calculate Average True Range as % of price
      let trSum = 0;
      for (let i = 1; i < recentData.length; i++) {
        const high = recentData[i].high;
        const low = recentData[i].low;
        const prevClose = recentData[i-1].close;
        
        const tr1 = high - low;
        const tr2 = Math.abs(high - prevClose);
        const tr3 = Math.abs(low - prevClose);
        
        const trueRange = Math.max(tr1, tr2, tr3);
        trSum += trueRange;
      }
      
      const atr = trSum / (recentData.length - 1);
      const currentPrice = recentData[recentData.length - 1].close;
      const atrPercent = (atr / currentPrice) * 100;
      
      // Score based on volatility
      let volatilityScore = 10; // Neutral starting point
      let explanation = "Average volatility";
      
      if (atrPercent < 0.5) {
        volatilityScore = 5;
        explanation = "Very low volatility: Limited swing potential";
      } else if (atrPercent < 1.0) {
        volatilityScore = 12;
        explanation = "Moderate-low volatility: Modest swing potential";
      } else if (atrPercent < 2.0) {
        volatilityScore = 18;
        explanation = "Ideal volatility: Good risk/reward for swing trading";
      } else if (atrPercent < 3.0) {
        volatilityScore = 15;
        explanation = "High volatility: Good potential but higher risk";
      } else {
        volatilityScore = 8;
        explanation = "Very high volatility: Excessive risk for typical swing trading";
      }
      
      return { score: volatilityScore, explanation, atrPercent };
    };
    
    // 3. Volume factor (0-15 points)
    const getVolumeScore = () => {
      const recentData = data.slice(-20);
      if (recentData.length < 5) return { score: 7.5, explanation: "Average volume (insufficient data)" };
      
      // Calculate average volume
      const volumes = recentData.map(d => d.volume).filter(v => v > 0);
      if (volumes.length === 0) return { score: 7.5, explanation: "No volume data available" };
      
      const avgVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
      const recentVolume = volumes.slice(-5).reduce((sum, vol) => sum + vol, 0) / 5;
      
      // Volume trend and consistency
      const volumeRatio = recentVolume / avgVolume;
      const volumeVariation = volumes.map(vol => Math.abs(vol - avgVolume) / avgVolume);
      const avgVariation = volumeVariation.reduce((sum, var1) => sum + var1, 0) / volumeVariation.length;
      
      // Score based on volume
      let volumeScore = 7.5; // Neutral starting point
      let explanation = "Average volume conditions";
      
      if (volumeRatio > 1.5 && avgVariation < 0.5) {
        volumeScore = 14;
        explanation = "Strong increasing volume with consistency";
      } else if (volumeRatio > 1.2) {
        volumeScore = 12;
        explanation = "Increasing volume: Growing market interest";
      } else if (volumeRatio < 0.7) {
        volumeScore = 5;
        explanation = "Declining volume: Decreasing market interest";
      } else if (avgVariation > 1.0) {
        volumeScore = 10;
        explanation = "Inconsistent volume: Potential for irregular moves";
      } else if (avgVariation < 0.3) {
        volumeScore = 9;
        explanation = "Very consistent volume: Predictable trading activity";
      }
      
      return { score: volumeScore, explanation };
    };
    
    // 4. Signal factor (0-20 points)
    const getSignalScore = () => {
      if (!signals || signals.length === 0) {
        return { score: 10, explanation: "No active signals" };
      }
      
      // Calculate signal score based on signal type, strength, and confidence
      let signalPoints = 0;
      let strongestSignal = null;
      let highestConfidence = 0;
      
      signals.forEach(signal => {
        let points = 0;
        
        // Points based on signal type
        if (signal.type === 'BUY') points += 5;
        else if (signal.type === 'SELL') points -= 5;
        
        // Points based on signal strength
        if (signal.strength === 'Strong') points = points > 0 ? points * 1.5 : points * 1.5;
        else if (signal.strength === 'Weak') points = points > 0 ? points * 0.5 : points * 0.5;
        
        // Points based on confidence
        const confidenceFactor = signal.confidence ? signal.confidence / 100 : 0.7;
        points *= confidenceFactor;
        
        signalPoints += points;
        
        // Track strongest signal
        if (signal.confidence > highestConfidence) {
          strongestSignal = signal;
          highestConfidence = signal.confidence;
        }
      });
      
      // Normalize to 0-20 range
      let normalizedScore = 10 + signalPoints * 2;
      normalizedScore = Math.max(0, Math.min(20, normalizedScore));
      
      let explanation = "Mixed signals with no clear direction";
      
      if (normalizedScore > 16) {
        explanation = "Strong bullish signals detected";
      } else if (normalizedScore > 13) {
        explanation = "Moderate bullish signals detected";
      } else if (normalizedScore < 4) {
        explanation = "Strong bearish signals detected";
      } else if (normalizedScore < 7) {
        explanation = "Moderate bearish signals detected";
      }
      
      if (strongestSignal) {
        explanation += ` (${strongestSignal.indicator})`;
      }
      
      return { score: normalizedScore, explanation };
    };
    
    // 5. Support/Resistance factor (0-10 points)
    const getSRScore = () => {
      if (!data || data.length < 10) {
        return { score: 5, explanation: "Neutral S/R positioning (insufficient data)" };
      }
      
      // Identify key levels using pivot points
      const findPivots = () => {
        const pivots = { support: [], resistance: [] };
        const windowSize = 5;
        
        for (let i = windowSize; i < data.length - windowSize; i++) {
          // Check for pivot high (resistance)
          const isPivotHigh = data[i].high === Math.max(...data.slice(i - windowSize, i + windowSize + 1).map(d => d.high));
          
          // Check for pivot low (support)
          const isPivotLow = data[i].low === Math.min(...data.slice(i - windowSize, i + windowSize + 1).map(d => d.low));
          
          if (isPivotHigh) {
            pivots.resistance.push(data[i].high);
          }
          
          if (isPivotLow) {
            pivots.support.push(data[i].low);
          }
        }
        
        return pivots;
      };
      
      const pivots = findPivots();
      const currentPrice = data[data.length - 1].close;
      
      // Find nearest levels
      let nearestSupport = null;
      let nearestResistance = null;
      let supportDistance = Infinity;
      let resistanceDistance = Infinity;
      
      pivots.support.forEach(level => {
        if (level < currentPrice) {
          const distance = currentPrice - level;
          if (distance < supportDistance) {
            supportDistance = distance;
            nearestSupport = level;
          }
        }
      });
      
      pivots.resistance.forEach(level => {
        if (level > currentPrice) {
          const distance = level - currentPrice;
          if (distance < resistanceDistance) {
            resistanceDistance = distance;
            nearestResistance = level;
          }
        }
      });
      
      // Calculate ratios
      const supportRatio = nearestSupport ? supportDistance / currentPrice : 1;
      const resistanceRatio = nearestResistance ? resistanceDistance / currentPrice : 1;
      
      // Score based on risk/reward ratio of S/R
      let srScore = 5; // Neutral starting point
      let explanation = "Balanced distance to support and resistance";
      
      // Ideal setup: Close to support, far from resistance (good for long swing)
      if (supportRatio < 0.02 && resistanceRatio > 0.05) {
        srScore = 9;
        explanation = "Near support, far from resistance: Favorable long setup";
      }
      // Ideal setup: Close to resistance, far from support (good for short swing)
      else if (resistanceRatio < 0.02 && supportRatio > 0.05) {
        srScore = 3;
        explanation = "Near resistance, far from support: Favorable short setup";
      }
      // Poor risk/reward: Roughly equal distance to both S/R
      else if (Math.abs(supportRatio - resistanceRatio) < 0.01) {
        srScore = 5;
        explanation = "Middle of range: Neutral position";
      }
      // Close to both S/R: Tight range, breakout potential
      else if (supportRatio < 0.03 && resistanceRatio < 0.03) {
        srScore = 7;
        explanation = "Tight S/R range: Potential breakout setup";
      }
      // Far from both S/R: Undefined range
      else if (supportRatio > 0.07 && resistanceRatio > 0.07) {
        srScore = 4;
        explanation = "Far from key levels: Undefined trading range";
      }
      
      return { score: srScore, explanation };
    };
    
    // 6. Liquidity/volume factor (0-10 points)
    const getLiquidityScore = () => {
      if (!data || data.length < 5) {
        return { score: 5, explanation: "Average liquidity (insufficient data)" };
      }
      
      // Get average daily volume over last 20 days
      const recentVolumes = data.slice(-20).map(d => d.volume).filter(v => v > 0);
      if (recentVolumes.length === 0) {
        return { score: 5, explanation: "No volume data available" };
      }
      
      const avgDailyVolume = recentVolumes.reduce((sum, vol) => sum + vol, 0) / recentVolumes.length;
      let liquidityScore = 5;
      let explanation = "Average liquidity";
      
      // Score based on absolute volume
      if (avgDailyVolume < 1000) {
        liquidityScore = 1;
        explanation = "Extremely low liquidity: High slippage risk";
      } else if (avgDailyVolume < 10000) {
        liquidityScore = 3;
        explanation = "Low liquidity: Difficult to enter/exit positions";
      } else if (avgDailyVolume < 50000) {
        liquidityScore = 6;
        explanation = "Moderate liquidity: Acceptable for swing trading";
      } else if (avgDailyVolume < 200000) {
        liquidityScore = 8;
        explanation = "Good liquidity: Easy to enter/exit positions";
      } else {
        liquidityScore = 10;
        explanation = "Excellent liquidity: Minimal slippage expected";
      }
      
      return { score: liquidityScore, explanation, avgDailyVolume };
    };
    
    // Calculate individual factor scores
    scoreFactors.trend = getTrendScore();
    scoreFactors.volatility = getVolatilityScore();
    scoreFactors.volume = getVolumeScore();
    scoreFactors.signal = getSignalScore();
    scoreFactors.supportResistance = getSRScore();
    scoreFactors.liquidity = getLiquidityScore();
    
    // Calculate total weighted score
    totalScore = (
      scoreFactors.trend.score * 0.25 +
      scoreFactors.volatility.score * 0.20 +
      scoreFactors.volume.score * 0.15 +
      scoreFactors.signal.score * 0.20 +
      scoreFactors.supportResistance.score * 0.10 +
      scoreFactors.liquidity.score * 0.10
    );
    
    totalScore = Math.round(totalScore);
    
    // Determine score category
    let scoreCategory, scoreDescription;
    
    if (totalScore >= 80) {
      scoreCategory = 'Excellent';
      scoreDescription = 'Highly favorable conditions for swing trading';
    } else if (totalScore >= 65) {
      scoreCategory = 'Good';
      scoreDescription = 'Favorable conditions for swing trading';
    } else if (totalScore >= 45) {
      scoreCategory = 'Neutral';
      scoreDescription = 'Average conditions for swing trading';
    } else if (totalScore >= 30) {
      scoreCategory = 'Poor';
      scoreDescription = 'Unfavorable conditions for swing trading';
    } else {
      scoreCategory = 'Very Poor';
      scoreDescription = 'Highly unfavorable conditions for swing trading';
    }
    
    const topFactor = Object.entries(scoreFactors)
      .sort((a, b) => b[1].score - a[1].score)[0];
    
    const weakestFactor = Object.entries(scoreFactors)
      .sort((a, b) => a[1].score - b[1].score)[0];
    
    // Generate swing trade recommendation
    let recommendation = '';
    
    if (totalScore >= 65) {
      recommendation = scoreFactors.signal.score > 15
        ? 'Consider opening long swing positions with clear stop levels'
        : 'Monitor for entry signals for potential long swings';
    } else if (totalScore <= 35) {
      recommendation = scoreFactors.signal.score < 5
        ? 'Consider short opportunities with proper risk management'
        : 'Avoid new long positions; consider reducing exposure';
    } else {
      recommendation = 'Hold existing positions; wait for clearer signals before new entries';
    }
    
    return {
      totalScore,
      scoreCategory,
      scoreDescription,
      recommendation,
      factors: scoreFactors,
      topFactor: {
        name: topFactor[0],
        ...topFactor[1]
      },
      weakestFactor: {
        name: weakestFactor[0],
        ...weakestFactor[1]
      }
    };
  }, [data, signals, etf]);
  
  if (loading) {
    return <div className="loading-indicator">Calculating swing score...</div>;
  }

  if (!scoreData) {
    return (
      <div className="swing-score-container">
        <h3 className="section-title">Swing Trading Score</h3>
        <div className="no-data">Insufficient data for scoring</div>
      </div>
    );
  }

  // Get color class based on overall score
  const getScoreColorClass = (score) => {
    if (score >= 80) return 'score-excellent';
    if (score >= 65) return 'score-good';
    if (score >= 45) return 'score-neutral';
    if (score >= 30) return 'score-poor';
    return 'score-very-poor';
  };
  
  // Get factor name for display
  const getFactorDisplayName = (factorName) => {
    const names = {
      trend: 'Trend',
      volatility: 'Volatility',
      volume: 'Volume',
      signal: 'Signals',
      supportResistance: 'Support/Resistance',
      liquidity: 'Liquidity'
    };
    
    return names[factorName] || factorName;
  };
  
  return (
    <div className="swing-score-container">
      <h3 className="section-title">Swing Trading Score</h3>
      
      <div className="score-main">
        <div className="score-header">
          <div className="overall-score-container">
            <div className={`overall-score ${getScoreColorClass(scoreData.totalScore)}`}>
              {scoreData.totalScore}
            </div>
            <div className="score-category">{scoreData.scoreCategory}</div>
          </div>
          <div className="score-description">
            {scoreData.scoreDescription}
          </div>
        </div>
        
        <div className="score-factors">
          {Object.entries(scoreData.factors).map(([factor, data]) => (
            <div 
              key={factor} 
              className={`factor-bar ${factor === scoreData.topFactor.name ? 'top-factor' : ''} 
                         ${factor === scoreData.weakestFactor.name ? 'weakest-factor' : ''}`}
            >
              <div className="factor-label">{getFactorDisplayName(factor)}</div>
              <div className="factor-bar-container">
                <div 
                  className={`factor-fill ${getScoreColorClass(data.score * 5)}`}
                  style={{ width: `${data.score * 5}%` }}
                ></div>
              </div>
              <div className="factor-score">{Math.round(data.score)}</div>
            </div>
          ))}
        </div>
        
        <div className="factor-insights">
          <div className="top-factor-insight">
            <span className="insight-label">Strongest Factor:</span>
            <span className="insight-value">
              {getFactorDisplayName(scoreData.topFactor.name)} - {scoreData.topFactor.explanation}
            </span>
          </div>
          <div className="weakest-factor-insight">
            <span className="insight-label">Weakest Factor:</span>
            <span className="insight-value">
              {getFactorDisplayName(scoreData.weakestFactor.name)} - {scoreData.weakestFactor.explanation}
            </span>
          </div>
        </div>
        
        <div className="score-recommendation">
          <div className="recommendation-label">Recommendation:</div>
          <div className="recommendation-text">
            {scoreData.recommendation}
          </div>
        </div>
      </div>
    </div>
  );
}
