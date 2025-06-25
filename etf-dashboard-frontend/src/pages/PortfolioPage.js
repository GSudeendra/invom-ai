import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, formatPercent } from '../utils/format';
import { ErrorState, EmptyState } from '../components/ui/ErrorState';
import { ETFCardSkeleton } from '../components/ui/LoadingSkeleton';

const PortfolioPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [portfolio, setPortfolio] = useState({
    holdings: [],
    totalValue: 0,
    totalReturn: 0,
    totalReturnPercent: 0,
    allocation: {}
  });

  // Mock portfolio data
  useEffect(() => {
    setPortfolio({
      holdings: [
        {
          id: 1,
          symbol: 'NIFTYBEES',
          name: 'Nippon India ETF Nifty 50 BeES',
          quantity: 100,
          avgPrice: 280.50,
          currentPrice: 281.93,
          currentValue: 28193,
          totalReturn: 143,
          returnPercent: 0.51,
          category: 'Nifty 50'
        },
        {
          id: 2,
          symbol: 'BANKBEES',
          name: 'Nippon India ETF Nifty Bank BeES',
          quantity: 50,
          avgPrice: 570.00,
          currentPrice: 577.56,
          currentValue: 28878,
          totalReturn: 378,
          returnPercent: 1.33,
          category: 'Banking'
        },
        {
          id: 3,
          symbol: 'GOLDBEES',
          name: 'Nippon India ETF Gold BeES',
          quantity: 200,
          avgPrice: 80.00,
          currentPrice: 82.13,
          currentValue: 16426,
          totalReturn: 426,
          returnPercent: 2.66,
          category: 'Gold'
        }
      ],
      totalValue: 73497,
      totalReturn: 947,
      totalReturnPercent: 1.30,
      allocation: {
        'Nifty 50': 38.4,
        'Banking': 39.3,
        'Gold': 22.3
      }
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <ETFCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Portfolio</h1>
                <p className="mt-2 text-gray-600">
                  Track your ETF investments and performance
                </p>
              </div>
              <Link to="/" className="btn btn-primary">
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(portfolio.totalValue)}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-success-100 rounded-lg">
                <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Return</p>
                <p className="text-2xl font-bold text-success-600">+{formatPrice(portfolio.totalReturn)}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-warning-100 rounded-lg">
                <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Return %</p>
                <p className="text-2xl font-bold text-success-600">+{formatPercent(portfolio.totalReturnPercent)}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-info-100 rounded-lg">
                <svg className="w-6 h-6 text-info-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Holdings</p>
                <p className="text-2xl font-bold text-gray-900">{portfolio.holdings.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Holdings List */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Holdings</h2>
              {portfolio.holdings.length === 0 ? (
                <EmptyState 
                  message="No holdings found" 
                  description="Start by adding some ETFs to your portfolio."
                />
              ) : (
                <div className="space-y-4">
                  {portfolio.holdings.map((holding) => (
                    <div key={holding.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary-600">{holding.symbol}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{holding.name}</p>
                            <p className="text-sm text-gray-500">{holding.category} • {holding.quantity} units</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatPrice(holding.currentValue)}</p>
                        <p className={`text-sm ${holding.returnPercent >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                          {holding.returnPercent >= 0 ? '+' : ''}{formatPercent(holding.returnPercent)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Allocation Chart */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Allocation</h2>
            <div className="space-y-4">
              {Object.entries(portfolio.allocation).map(([category, percentage]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                    <span className="ml-3 font-medium text-gray-900">{category}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{percentage}%</span>
                </div>
              ))}
            </div>
            
            {/* Add Holding Button */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button className="btn btn-primary w-full">
                + Add Holding
              </button>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Holding</h3>
            <p className="text-gray-600 mb-4">Add new ETFs to your portfolio</p>
            <button className="btn btn-primary w-full">Add ETF</button>
          </div>

          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance</h3>
            <p className="text-gray-600 mb-4">View detailed performance analysis</p>
            <button className="btn btn-success w-full">View Analysis</button>
          </div>

          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reports</h3>
            <p className="text-gray-600 mb-4">Generate portfolio reports</p>
            <button className="btn btn-warning w-full">Generate Report</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage; 