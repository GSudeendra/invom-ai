import React from 'react';

/**
 * PatternHighlight - Identifies and displays chart patterns for technical analysis
 */
export default function PatternHighlight({ patterns, loading }) {
  if (loading) {
    return <div className="loading-indicator">Loading pattern data...</div>;
  }

  if (!patterns || patterns.length === 0) {
    return (
      <div className="pattern-highlight-container">
        <h3 className="section-title">Chart Patterns</h3>
        <div className="no-patterns">No chart patterns detected in current timeframe</div>
      </div>
    );
  }

  // Get pattern icon based on type
  const getPatternIcon = (type) => {
    const patternIcons = {
      'Double Bottom': '⚍',
      'Double Top': '⚎',
      'Head and Shoulders': '⚏',
      'Inverse Head and Shoulders': '⚌',
      'Cup and Handle': '∪_',
      'Triangle': '◿',
      'Wedge': '⋀',
      'Channel': '=',
      'Flag': '⚐',
      'Rectangle': '□',
      'Support Bounce': '↗',
      'Resistance Rejection': '↘',
      'Breakout': '↑',
      'Breakdown': '↓'
    };

    return patternIcons[type] || '◈';
  };

  // Get pattern direction class for styling
  const getDirectionClass = (direction) => {
    return direction?.toLowerCase() === 'bullish' ? 'direction-bullish' : 'direction-bearish';
  };

  // Get significance class based on strength
  const getSignificanceClass = (significance) => {
    if (significance >= 80) return 'significance-high';
    if (significance >= 60) return 'significance-medium';
    return 'significance-low';
  };

  return (
    <div className="pattern-highlight-container">
      <h3 className="section-title">Chart Patterns</h3>

      <div className="patterns-list">
        {patterns.map((pattern, index) => (
          <div key={index} className="pattern-item">
            <div className="pattern-icon">
              {getPatternIcon(pattern.type)}
            </div>

            <div className="pattern-details">
              <div className="pattern-header">
                <div className="pattern-name">{pattern.type}</div>
                <div className={`pattern-direction ${getDirectionClass(pattern.direction)}`}>
                  {pattern.direction}
                </div>
              </div>

              <div className="pattern-significance">
                <span className="significance-label">Reliability:</span>
                <div className="significance-bar-container">
                  <div
                    className={`significance-bar ${getSignificanceClass(pattern.significance)}`}
                    style={{ width: `${pattern.significance || 0}%` }}
                  ></div>
                </div>
                <span className="significance-value">{pattern.significance || 0}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pattern-explanation">
        <p className="explanation-text">
          Chart patterns are formations that appear in price charts that may help predict future price movements.
          Higher reliability scores indicate stronger pattern formations.
        </p>
      </div>
    </div>
  );
}
