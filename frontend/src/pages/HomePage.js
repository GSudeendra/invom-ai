import React, { useEffect, useState } from 'react';
import '../styles/HomePage.css';
import { Link, useLocation } from 'react-router-dom';

const initialMarketData = [
  { symbol: 'SPY', price: 445.67, change: 1.24 },
  { symbol: 'QQQ', price: 378.92, change: 0.87 },
  { symbol: 'VTI', price: 248.15, change: -0.42 },
  { symbol: 'IWM', price: 198.33, change: 2.15 },
  { symbol: 'EFA', price: 76.89, change: 0.56 },
  { symbol: 'EEM', price: 39.24, change: -1.33 },
];

export default function HomePage() {
  const [marketData, setMarketData] = useState(initialMarketData);
  const [activeTab, setActiveTab] = useState('dashboard');
  const location = useLocation();

  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prevData =>
        prevData.map(item => {
          // Simulate a random price change between -1 and 1
          const change = (Math.random() - 0.5) * 2;
          const newPrice = Math.max(item.price + change, 0.01);
          const changePercent = ((change / item.price) * 100).toFixed(2);
          return {
            ...item,
            price: parseFloat(newPrice.toFixed(2)),
            change: parseFloat(changePercent),
          };
        })
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Floating shapes mousemove effect
  useEffect(() => {
    function handleMouseMove(e) {
      const shapes = document.querySelectorAll('.shape');
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      shapes.forEach((shape, index) => {
        const speed = (index + 1) * 0.5;
        const xMove = (x - 0.5) * speed * 40; // scale for visible effect
        const yMove = (y - 0.5) * speed * 40;
        shape.style.transform = `translate(${xMove}px, ${yMove}px)`;
      });
    }
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Add background gradient to the root div
  const rootStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
    color: 'white',
    overflowX: 'hidden',
  };

  // Handler to disable navigation
  const preventNav = e => e.preventDefault();

  return (
    <div style={rootStyle}>
      {/* Floating shapes */}
      <div className="floating-shapes">
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
      </div>
      {/* Header */}
      <header>
        <div className="container">
          <nav>
            <div className="logo">OM AI</div>
            <div className="nav-links">
              <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>ETF Dashboard</Link>
              <Link to="/portfolio" className={activeTab === 'portfolio' ? 'active' : ''}>Portfolio</Link>
              <a href="#" onClick={preventNav}>Analytics</a>
              <a href="#" onClick={preventNav}>Alerts</a>
            </div>
            <div className="user-profile">
              <div style={{width: 32, height: 32, background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '50%'}}></div>
              <span>John Trader</span>
            </div>
          </nav>
        </div>
      </header>
      <main>
        <div className="container">
          {/* Tab Content */}
          {activeTab === 'dashboard' && (
            <>
          {/* Hero Section */}
          <section className="hero">
            <div className="hero-content">
              <div className="ai-indicator">
                <div className="ai-pulse"></div>
                AI-Powered Trading Intelligence
              </div>
              <h1>Smart Trading<br/>Simplified</h1>
              <p>Leverage advanced AI algorithms for swing trading analysis, ETF optimization, and real-time market insights</p>
            </div>
          </section>
          {/* Dashboard Cards */}
          <section className="dashboard-grid">
            <Link to="/dashboard" className="dashboard-card">
              <div className="card-icon">📊</div>
              <h3 className="card-title">ETF Dashboard</h3>
              <p className="card-description">Monitor your ETF portfolio performance with real-time analytics and AI-driven insights</p>
              <div className="card-stats">
                <div className="stat-item">
                  <div className="stat-value">+12.4%</div>
                  <div className="stat-label">Total Return</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">47</div>
                  <div className="stat-label">Holdings</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">$142K</div>
                  <div className="stat-label">Portfolio Value</div>
                </div>
              </div>
            </Link>
            <div className="dashboard-card">
              <div className="card-icon">📈</div>
              <h3 className="card-title">Swing Trading Analysis</h3>
              <p className="card-description">AI-powered swing trading signals with technical analysis and momentum indicators</p>
              <div className="card-stats">
                <div className="stat-item">
                  <div className="stat-value">8</div>
                  <div className="stat-label">Active Signals</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">73%</div>
                  <div className="stat-label">Win Rate</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">+8.2%</div>
                  <div className="stat-label">This Month</div>
                </div>
              </div>
            </div>
            <div className="dashboard-card">
              <div className="card-icon">🤖</div>
              <h3 className="card-title">AI Market Intelligence</h3>
              <p className="card-description">Advanced machine learning models analyzing market trends and opportunities</p>
              <div className="card-stats">
                <div className="stat-item">
                  <div className="stat-value">23</div>
                  <div className="stat-label">Opportunities</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">High</div>
                  <div className="stat-label">Confidence</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">Live</div>
                  <div className="stat-label">Status</div>
                </div>
              </div>
            </div>
            <div className="dashboard-card">
              <div className="card-icon">🛡️</div>
              <h3 className="card-title">Risk Management</h3>
              <p className="card-description">Intelligent position sizing, stop-loss optimization, and portfolio risk assessment</p>
              <div className="card-stats">
                <div className="stat-item">
                  <div className="stat-value">Low</div>
                  <div className="stat-label">Current Risk</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">0.8</div>
                  <div className="stat-label">Sharpe Ratio</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">15%</div>
                  <div className="stat-label">Max Drawdown</div>
                </div>
              </div>
            </div>
          </section>
          {/* Market Overview */}
          <section className="market-overview">
            <h2 className="section-title">Market Overview</h2>
            <div className="market-grid">
              {marketData.map((item, idx) => (
                <div className="market-item" key={item.symbol}>
                  <div className="market-symbol">{item.symbol}</div>
                  <div className="market-price">${item.price.toFixed(2)}</div>
                  <div className={`market-change ${item.change >= 0 ? 'positive' : 'negative'}`}>
                    {item.change >= 0 ? `+${item.change}%` : `${item.change}%`}
                  </div>
                </div>
              ))}
            </div>
          </section>
          {/* Quick Actions */}
          <section className="quick-actions">
            <h2 className="section-title">Quick Actions</h2>
            <div className="actions-grid">
              <button className="action-btn" onClick={() => alert('New Trade')}>
                <span className="action-icon">⚡</span>
                <div>New Trade</div>
              </button>
              <button className="action-btn" onClick={() => alert('Market Scan')}>
                <span className="action-icon">🔍</span>
                <div>Market Scan</div>
              </button>
              <button className="action-btn" onClick={() => alert('Price Alerts')}>
                <span className="action-icon">🔔</span>
                <div>Price Alerts</div>
              </button>
              <button className="action-btn" onClick={() => alert('Backtest Strategy')}>
                <span className="action-icon">📋</span>
                <div>Backtest Strategy</div>
              </button>
              <button className="action-btn" onClick={() => alert('AI Research')}>
                <span className="action-icon">📊</span>
                <div>AI Research</div>
              </button>
              <button className="action-btn" onClick={() => alert('Settings')}>
                <span className="action-icon">⚙️</span>
                <div>Settings</div>
              </button>
            </div>
          </section>
          {/* AI Insights */}
          <section className="ai-insights">
            <h2 className="section-title">AI Trading Insights</h2>
            <div className="insight-item">
              <div className="insight-icon">💡</div>
              <div>
                <h4 style={{marginBottom: 8}}>Strong Bullish Signal Detected</h4>
                <p style={{color: 'rgba(255,255,255,0.7)'}}>NVDA showing strong momentum with AI confirming breakout pattern. Consider swing position with 5% stop-loss.</p>
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-icon">⚠️</div>
              <div>
                <h4 style={{marginBottom: 8}}>Market Volatility Alert</h4>
                <p style={{color: 'rgba(255,255,255,0.7)'}}>VIX levels suggest increased volatility ahead. Consider reducing position sizes and tightening stops.</p>
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-icon">🎯</div>
              <div>
                <h4 style={{marginBottom: 8}}>ETF Rebalancing Opportunity</h4>
                <p style={{color: 'rgba(255,255,255,0.7)'}}>Technology sector showing overweight allocation. AI suggests rebalancing to maintain optimal risk profile.</p>
              </div>
            </div>
          </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
} 