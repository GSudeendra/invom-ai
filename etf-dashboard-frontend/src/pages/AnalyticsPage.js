import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, formatPercent } from '../utils/format';
import { ErrorState, EmptyState } from '../components/ui/ErrorState';
import { ETFCardSkeleton } from '../components/ui/LoadingSkeleton';

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    topPerformers: [],
    categoryPerformance: [],
    marketOverview: {},
    recentTrends: []
  });

  // Mock data for demonstration
  useEffect(() => {
    setAnalyticsData({
      topPerformers: [
        { name: 'Nifty 50 ETF', return: 15.2, nav: 280.45, category: 'Nifty 50' },
        { name: 'Bank Nifty ETF', return: 12.8, nav: 575.28, category: 'Banking' },
        { name: 'IT ETF', return: 8.5, nav: 420.42, category: 'IT' },
        { name: 'Gold ETF', return: 6.2, nav: 82.68, category: 'Gold' },
        { name: 'Mid Cap ETF', return: 4.8, nav: 21.50, category: 'Mid Cap' }
      ],
      categoryPerformance: [
        { category: 'Nifty 50', avgReturn: 12.5, etfCount: 25 },
        { category: 'Banking', avgReturn: 10.2, etfCount: 18 },
        { category: 'IT', avgReturn: 8.7, etfCount: 12 },
        { category: 'Gold', avgReturn: 6.1, etfCount: 8 },
        { category: 'Mid Cap', avgReturn: 4.3, etfCount: 15 }
      ],
      marketOverview: {
        totalEtfs: 125,
        avgReturn: 8.4,
        topCategory: 'Nifty 50',
        marketCap: '₹2.5T'
      },
      recentTrends: [
        { date: '2025-06-20', avgNav: 245.67, change: 1.2 },
        { date: '2025-06-19', avgNav: 242.45, change: -0.8 },
        { date: '2025-06-18', avgNav: 244.32, change: 0.9 },
        { date: '2025-06-17', avgNav: 242.15, change: -1.1 },
        { date: '2025-06-16', avgNav: 244.89, change: 2.3 }
      ]
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
                <h1 className="text-3xl font-bold text-gray-900">ETF Analytics</h1>
                <p className="mt-2 text-gray-600">
                  Advanced performance analysis and market insights
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
        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total ETFs</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.marketOverview.totalEtfs}</p>
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
                <p className="text-sm font-medium text-gray-600">Avg Return</p>
                <p className="text-2xl font-bold text-gray-900">{formatPercent(analyticsData.marketOverview.avgReturn)}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-warning-100 rounded-lg">
                <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Top Category</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.marketOverview.topCategory}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-info-100 rounded-lg">
                <svg className="w-6 h-6 text-info-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Market Cap</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.marketOverview.marketCap}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performers */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Performers</h2>
            <div className="space-y-4">
              {analyticsData.topPerformers.map((etf, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-sm font-semibold text-primary-600">
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{etf.name}</p>
                      <p className="text-sm text-gray-500">{etf.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-success-600">+{formatPercent(etf.return)}</p>
                    <p className="text-sm text-gray-500">₹{formatPrice(etf.nav)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Performance */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Category Performance</h2>
            <div className="space-y-4">
              {analyticsData.categoryPerformance.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                    <span className="ml-3 font-medium text-gray-900">{category.category}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">{category.etfCount} ETFs</span>
                    <span className="font-semibold text-success-600">+{formatPercent(category.avgReturn)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Trends Chart */}
        <div className="card p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Market Trends</h2>
          <div className="h-64 flex items-end justify-between space-x-2">
            {analyticsData.recentTrends.map((trend, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-primary-500 rounded-t"
                  style={{ 
                    height: `${Math.abs(trend.change) * 20}px`,
                    backgroundColor: trend.change >= 0 ? '#10B981' : '#EF4444'
                  }}
                ></div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  <div>{new Date(trend.date).toLocaleDateString()}</div>
                  <div className={`font-medium ${trend.change >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                    {trend.change >= 0 ? '+' : ''}{formatPercent(trend.change)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Comparison</h3>
            <p className="text-gray-600 mb-4">Compare ETF performance across different time periods</p>
            <button className="btn btn-primary w-full">Compare ETFs</button>
          </div>

          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Portfolio Analysis</h3>
            <p className="text-gray-600 mb-4">Analyze your portfolio performance and allocation</p>
            <button className="btn btn-success w-full">Analyze Portfolio</button>
          </div>

          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Insights</h3>
            <p className="text-gray-600 mb-4">Get detailed market insights and trends</p>
            <button className="btn btn-warning w-full">View Insights</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage; 