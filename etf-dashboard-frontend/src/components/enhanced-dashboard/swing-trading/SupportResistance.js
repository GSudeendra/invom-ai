import React from 'react';

/**
 * SupportResistance - Displays support and resistance levels for technical analysis
 */
export default function SupportResistance({ levels, currentPrice, loading }) {
  if (loading) {
    return <div className="loading-indicator">Loading support/resistance levels...</div>;
  }

  if (!levels || (!levels.support && !levels.resistance)) {
    return (
      <div className="sr-levels-container">
        <h3 className="section-title">Support & Resistance</h3>
        <div className="no-levels">No support/resistance levels identified</div>
      </div>
    );
  }

  const { support = [], resistance = [] } = levels;

  // Calculate proximity to current price
  const calculateProximity = (price) => {
    if (!currentPrice) return 0;
    return Math.abs(((price - currentPrice) / currentPrice) * 100);
  };

  // Determine if a level is nearby (within 3% of current price)
  const isNearby = (price) => {
    return calculateProximity(price) < 3;
  };

  return (
    <div className="sr-levels-container">
      <h3 className="section-title">Support & Resistance</h3>

      <div className="sr-content">
        <div className="resistance-section">
          <h4 className="sr-subtitle">Resistance Levels</h4>
          {resistance.length > 0 ? (
            <div className="levels-list">
              {resistance
                .sort((a, b) => a.price - b.price)
                .map((level, index) => (
                  <div
                    key={`resistance-${index}`}
                    className={`level-item resistance ${isNearby(level.price) ? 'nearby' : ''}`}
                  >
                    <div className="level-price">₹{level.price.toFixed(2)}</div>
                    <div className="level-strength-container">
                      <div
                        className="level-strength-bar"
                        style={{ width: `${level.strength || 0}%` }}
                      ></div>
                    </div>
                    <div className="level-touches">
                      <span className="touches-label">Touches:</span>
                      <span className="touches-value">{level.touches}</span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="no-levels">No resistance levels detected</div>
          )}
        </div>

        {currentPrice && (
          <div className="current-price-indicator">
            <div className="current-price-label">Current Price:</div>
            <div className="current-price-value">₹{currentPrice.toFixed(2)}</div>
          </div>
        )}

        <div className="support-section">
          <h4 className="sr-subtitle">Support Levels</h4>
          {support.length > 0 ? (
            <div className="levels-list">
              {support
                .sort((a, b) => b.price - a.price)
                .map((level, index) => (
                  <div
                    key={`support-${index}`}
                    className={`level-item support ${isNearby(level.price) ? 'nearby' : ''}`}
                  >
                    <div className="level-price">₹{level.price.toFixed(2)}</div>
                    <div className="level-strength-container">
                      <div
                        className="level-strength-bar"
                        style={{ width: `${level.strength || 0}%` }}
                      ></div>
                    </div>
                    <div className="level-touches">
                      <span className="touches-label">Touches:</span>
                      <span className="touches-value">{level.touches}</span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="no-levels">No support levels detected</div>
          )}
        </div>
      </div>

      <div className="sr-explanation">
        <p className="explanation-text">
          Support and resistance are price levels where the market has historically had difficulty crossing beyond.
          Support acts as a floor, while resistance acts as a ceiling. More touches indicate stronger levels.
        </p>
      </div>
    </div>
  );
}
