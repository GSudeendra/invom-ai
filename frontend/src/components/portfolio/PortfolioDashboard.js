import React, { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target, PieChart as PieChartIcon, BarChart3, FileText, Activity, Loader2, RefreshCw, ArrowLeft, Home, AlertTriangle, Eye, Bell, Settings, Filter, Search, Calendar, Download } from 'lucide-react';
import { parseCSV, convertCSVToStockData, isCSVFormat } from '../../utils/csvParser';
import { enhanceStockDataWithSectors, getSectorDistribution } from '../../utils/stockSectorApi';

const PortfolioDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [mutualFundData, setMutualFundData] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [enhancedStockData, setEnhancedStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sectorLoading, setSectorLoading] = useState(false);

  const timeframes = ['1D', '1W', '1M', '3M', '1Y'];
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');

  // Load data from files on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load mutual fund data
        const mfResponse = await fetch('/mydata/mutualFunds.json');
        if (!mfResponse.ok) {
          throw new Error('Failed to load mutual fund data');
        }
        const mfData = await mfResponse.json();
        setMutualFundData(mfData);
        
        // Load stock data - try CSV first, then JSON
        let stockData = [];
        try {
          // Try to load CSV first
          const csvResponse = await fetch('/mydata/stocks.csv');
          if (csvResponse.ok) {
            const csvText = await csvResponse.text();
            if (isCSVFormat(csvText)) {
              const parsedCSV = parseCSV(csvText);
              stockData = convertCSVToStockData(parsedCSV);
              console.log('Loaded stock data from CSV:', stockData);
            } else {
              throw new Error('Invalid CSV format');
            }
          } else {
            // Fallback to JSON
            const stockResponse = await fetch('/mydata/stocks.json');
            if (!stockResponse.ok) {
              throw new Error('Failed to load stock data (both CSV and JSON)');
            }
            stockData = await stockResponse.json();
            console.log('Loaded stock data from JSON:', stockData);
          }
        } catch (stockError) {
          console.warn('Stock data loading error:', stockError.message);
          // Continue with empty stock data
          stockData = [];
        }
        
        setStockData(stockData);
        
      } catch (err) {
        console.error('Error loading portfolio data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Enhance stock data with sector information when stock data changes
  useEffect(() => {
    const enhanceStockData = async () => {
      if (stockData.length > 0) {
        try {
          setSectorLoading(true);
          const enhanced = await enhanceStockDataWithSectors(stockData);
          setEnhancedStockData(enhanced);
          console.log('Enhanced stock data with sectors:', enhanced);
        } catch (error) {
          console.error('Error enhancing stock data with sectors:', error);
          // Fallback to original stock data
          setEnhancedStockData(stockData);
        } finally {
          setSectorLoading(false);
        }
      } else {
        setEnhancedStockData([]);
      }
    };

    enhanceStockData();
  }, [stockData]);

  // Use enhanced stock data for calculations
  const finalStockData = enhancedStockData.length > 0 ? enhancedStockData : stockData;

  // Calculate totals and analytics with proper null checks
  const mfTotals = useMemo(() => {
    const totalInvested = mutualFundData.reduce((sum, fund) => sum + (fund.CostValue || fund.invested || 0), 0);
    const totalCurrent = mutualFundData.reduce((sum, fund) => sum + (fund.CurrentValue || fund.current || 0), 0);
    const totalGain = totalCurrent - totalInvested;
    const overallReturn = totalInvested > 0 ? ((totalCurrent - totalInvested) / totalInvested) * 100 : 0;
    
    return { totalInvested, totalCurrent, totalGain, overallReturn };
  }, [mutualFundData]);

  const stockTotals = useMemo(() => {
    const totalInvested = finalStockData.reduce((sum, stock) => sum + (stock.invested || 0), 0);
    const totalCurrent = finalStockData.reduce((sum, stock) => sum + (stock.current || 0), 0);
    const totalGain = totalCurrent - totalInvested;
    const overallReturn = totalInvested > 0 ? ((totalCurrent - totalInvested) / totalInvested) * 100 : 0;
    
    return { totalInvested, totalCurrent, totalGain, overallReturn };
  }, [finalStockData]);

  // Calculate portfolio-wide totals
  const portfolioTotals = useMemo(() => {
    const totalInvested = mfTotals.totalInvested + stockTotals.totalInvested;
    const totalCurrent = mfTotals.totalCurrent + stockTotals.totalCurrent;
    const totalGain = totalCurrent - totalInvested;
    const overallReturn = totalInvested > 0 ? ((totalCurrent - totalInvested) / totalInvested) * 100 : 0;
    
    return { totalInvested, totalCurrent, totalGain, overallReturn };
  }, [mfTotals, stockTotals]);

  // Sector allocation for mutual funds - improved categorization
  const mfSectorData = useMemo(() => {
    const sectorMap = {};
    mutualFundData.forEach(fund => {
      // Map fund types to sectors for better categorization
      const fundType = fund.Type || fund.type || 'Unknown';
      let sector = 'Unknown';
      
      if (fundType.includes('Index')) {
        sector = 'Index Fund';
      } else if (fundType.includes('Equity')) {
        sector = 'Equity';
      } else if (fundType.includes('Arbitrage')) {
        sector = 'Arbitrage';
      } else if (fundType.includes('Bond')) {
        sector = 'Bond';
      } else if (fundType.includes('Debt')) {
        sector = 'Debt';
      } else if (fundType.includes('Liquid')) {
        sector = 'Liquid';
      } else {
        sector = fundType;
      }
      
      if (!sectorMap[sector]) {
        sectorMap[sector] = 0;
      }
      sectorMap[sector] += fund.CurrentValue || fund.current || 0;
    });
    
    return Object.entries(sectorMap)
      .filter(([sector, value]) => value > 0) // Only include sectors with value
      .map(([sector, value]) => ({
        name: sector,
        value: value,
        percentage: mfTotals.totalCurrent > 0 ? ((value / mfTotals.totalCurrent) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.value - a.value); // Sort by value descending
  }, [mfTotals.totalCurrent, mutualFundData]);

  // Risk allocation - improved logic with better categorization
  const riskData = useMemo(() => {
    const riskMap = {};
    mutualFundData.forEach(fund => {
      const fundType = fund.Type || fund.type || 'Unknown';
      const fundName = fund.Scheme || fund.name || '';
      let risk = 'Medium';
      
      // More comprehensive risk categorization
      if (fundType.includes('Index') || fundType.includes('Arbitrage') || fundType.includes('Liquid')) {
        risk = 'Low';
      } else if (fundType.includes('Bond') || fundType.includes('Debt')) {
        risk = 'Low';
      } else if (fundType.includes('Equity')) {
        // Check for specific equity types
        if (fundName.includes('Small') || fundName.includes('Mid') || fundType.includes('Small') || fundType.includes('Mid')) {
          risk = 'Very High';
        } else if (fundName.includes('Large') || fundType.includes('Large')) {
          risk = 'High';
        } else {
          risk = 'High';
        }
      } else if (fundType.includes('Multi') || fundType.includes('Flexi')) {
        risk = 'High';
      } else {
        risk = 'Medium';
      }
      
      if (!riskMap[risk]) {
        riskMap[risk] = 0;
      }
      riskMap[risk] += fund.CurrentValue || fund.current || 0;
    });
    
    return Object.entries(riskMap)
      .filter(([risk, value]) => value > 0) // Only include risks with value
      .map(([risk, value]) => ({
        name: risk,
        value: value,
        percentage: mfTotals.totalCurrent > 0 ? ((value / mfTotals.totalCurrent) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => {
        // Sort by risk level: Low, Medium, High, Very High
        const riskOrder = { 'Low': 1, 'Medium': 2, 'High': 3, 'Very High': 4 };
        return riskOrder[a.name] - riskOrder[b.name];
      });
  }, [mfTotals.totalCurrent, mutualFundData]);

  // AMC allocation - improved with better data handling
  const amcData = useMemo(() => {
    const amcMap = {};
    mutualFundData.forEach(fund => {
      const amc = fund.AMCName || fund.amc || 'Unknown';
      if (!amcMap[amc]) {
        amcMap[amc] = 0;
      }
      amcMap[amc] += fund.CurrentValue || fund.current || 0;
    });
    
    return Object.entries(amcMap)
      .filter(([amc, value]) => value > 0) // Only include AMCs with value
      .map(([amc, value]) => ({
        name: amc,
        value: value,
        percentage: mfTotals.totalCurrent > 0 ? ((value / mfTotals.totalCurrent) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.value - a.value); // Sort by value descending
  }, [mfTotals.totalCurrent, mutualFundData]);

  // Stock sector distribution using enhanced data
  const stockSectorData = useMemo(() => {
    return getSectorDistribution(finalStockData);
  }, [finalStockData]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'];

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const StatCard = ({ title, value, change, changePercent, icon: Icon, subtitle }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        {change !== undefined && change !== null && (
          <div className="flex items-center space-x-2">
            {change > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(change))} ({Math.abs(changePercent || 0).toFixed(2)}%)
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-blue-600">
            {formatCurrency(payload[0].value)} ({payload[0].payload.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label renderer for pie chart to prevent label overlap
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show label if percentage is significant (>5%)
    if (percent > 0.05) {
      return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12" fontWeight="bold">
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      );
    }
    return null;
  };

  // Navigation functions
  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingDown className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Portfolio
              </h1>
              <div className="flex items-center space-x-1 bg-white/70 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-600 hover:text-blue-600'}`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('mutual-funds')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'mutual-funds' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-600 hover:text-blue-600'}`}
                >
                  Mutual Funds
                </button>
                <button
                  onClick={() => setActiveTab('stocks')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'stocks' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-600 hover:text-blue-600'}`}
                >
                  Stocks
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'analytics' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-600 hover:text-blue-600'}`}
                >
                  Analytics
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                className="p-2 bg-white/70 rounded-lg hover:bg-blue-100 transition-all flex items-center gap-2 text-blue-700 font-semibold"
                onClick={handleGoHome}
                title="Go to Home"
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">Home</span>
              </button>
              <div className="flex items-center space-x-1 bg-white/70 rounded-lg p-1">
                {timeframes.map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedTimeframe(period)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${selectedTimeframe === period ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-blue-600'}`}
                  >
                    {period}
                  </button>
                ))}
              </div>
              <button className="p-2 bg-white/70 rounded-lg hover:bg-white/90 transition-all">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 bg-white/70 rounded-lg hover:bg-white/90 transition-all">
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 bg-white/70 rounded-lg hover:bg-white/90 transition-all">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Enhanced Summary Cards */}
        {activeTab !== 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/70 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {activeTab === 'overview' ? 'Total' : activeTab === 'mutual-funds' ? 'MF' : 'Stocks'}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Total Invested</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeTab === 'overview' 
                    ? formatCurrency(portfolioTotals.totalInvested)
                    : activeTab === 'mutual-funds' 
                      ? formatCurrency(mfTotals.totalInvested)
                      : formatCurrency(stockTotals.totalInvested)
                  }
                </p>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">Live</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Current Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeTab === 'overview' 
                    ? formatCurrency(portfolioTotals.totalCurrent)
                    : activeTab === 'mutual-funds' 
                      ? formatCurrency(mfTotals.totalCurrent)
                      : formatCurrency(stockTotals.totalCurrent)
                  }
                </p>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full">P&L</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Total Gain/Loss</p>
                <p className={`text-2xl font-bold ${
                  activeTab === 'overview' 
                    ? (portfolioTotals.totalGain >= 0 ? 'text-green-600' : 'text-red-600')
                    : activeTab === 'mutual-funds' 
                      ? (mfTotals.totalGain >= 0 ? 'text-green-600' : 'text-red-600')
                      : (stockTotals.totalGain >= 0 ? 'text-green-600' : 'text-red-600')
                }`}>
                  {activeTab === 'overview' 
                    ? formatCurrency(portfolioTotals.totalGain)
                    : activeTab === 'mutual-funds' 
                      ? formatCurrency(mfTotals.totalGain)
                      : formatCurrency(stockTotals.totalGain)
                  }
                </p>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-xs font-medium text-orange-700 bg-orange-100 px-2 py-1 rounded-full">Returns</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Overall Return</p>
                <p className={`text-2xl font-bold ${
                  activeTab === 'overview' 
                    ? (portfolioTotals.overallReturn >= 0 ? 'text-green-600' : 'text-red-600')
                    : activeTab === 'mutual-funds' 
                      ? (mfTotals.overallReturn >= 0 ? 'text-green-600' : 'text-red-600')
                      : (stockTotals.overallReturn >= 0 ? 'text-green-600' : 'text-red-600')
                }`}>
                  {activeTab === 'overview' 
                    ? (portfolioTotals.overallReturn >= 0 ? '+' : '') + portfolioTotals.overallReturn.toFixed(2) + '%'
                    : activeTab === 'mutual-funds' 
                      ? (mfTotals.overallReturn >= 0 ? '+' : '') + mfTotals.overallReturn.toFixed(2) + '%'
                      : (stockTotals.overallReturn >= 0 ? '+' : '') + stockTotals.overallReturn.toFixed(2) + '%'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Portfolio Overview Content */}
            <div className="bg-white/70 backdrop-blur-lg rounded-xl p-8 border border-white/20 shadow-lg">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Portfolio Overview</h2>
                <p className="text-gray-600 mb-6">Comprehensive view of your entire investment portfolio</p>
                
                {/* Work in Progress Message */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                  <div className="flex items-center justify-center mb-3">
                    <AlertTriangle className="w-6 h-6 text-yellow-600 mr-2" />
                    <span className="text-lg font-semibold text-yellow-800">Work in Progress</span>
                  </div>
                  <p className="text-sm text-yellow-700 text-center">
                    This feature is currently under development. You'll soon be able to view your complete portfolio overview with consolidated analytics, performance metrics, and strategic insights.
                  </p>
                </div>
                
                {/* Coming Soon Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Performance Tracking</h3>
                    <p className="text-xs text-gray-600">Real-time portfolio performance with historical analysis</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                      <PieChart className="w-4 h-4 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Asset Allocation</h3>
                    <p className="text-xs text-gray-600">Visual breakdown of your portfolio across asset classes</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                      <Target className="w-4 h-4 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Goal Tracking</h3>
                    <p className="text-xs text-gray-600">Monitor progress towards your financial goals</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Portfolio Analytics Content */}
            <div className="bg-white/70 backdrop-blur-lg rounded-xl p-8 border border-white/20 shadow-lg">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Portfolio Analytics</h2>
                <p className="text-gray-600 mb-6">Advanced analytics and insights for your investment decisions</p>
                
                {/* Work in Progress Message */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
                  <div className="flex items-center justify-center mb-3">
                    <AlertTriangle className="w-6 h-6 text-blue-600 mr-2" />
                    <span className="text-lg font-semibold text-blue-800">Work in Progress</span>
                  </div>
                  <p className="text-sm text-blue-700 text-center">
                    Advanced analytics features are being developed. Soon you'll have access to market analysis, trend detection, and AI-powered insights.
                  </p>
                </div>
                
                {/* Coming Soon Analytics Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Market Analysis</h3>
                    <p className="text-xs text-gray-600">Real-time market trends and sentiment analysis</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                      <BarChart3 className="w-4 h-4 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Trend Detection</h3>
                    <p className="text-xs text-gray-600">Pattern recognition and trend forecasting</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                      <RefreshCw className="w-4 h-4 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Market Timing</h3>
                    <p className="text-xs text-gray-600">Optimal entry and exit timing signals</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                      <Eye className="w-4 h-4 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">AI Insights</h3>
                    <p className="text-xs text-gray-600">Machine learning powered recommendations</p>
                  </div>
                </div>

                {/* Additional Analytics Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Technical Indicators</h3>
                    <p className="text-xs text-gray-600">RSI, MACD, Moving averages and more</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
                      <PieChart className="w-4 h-4 text-yellow-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Sector Rotation</h3>
                    <p className="text-xs text-gray-600">Sector performance and rotation analysis</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
                      <Target className="w-4 h-4 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Volatility Analysis</h3>
                    <p className="text-xs text-gray-600">Market volatility and risk assessment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Dashboard Content (unchanged) */}
        <div className="px-0 py-0">
          {/* Mutual Funds Tab */}
          {activeTab === 'mutual-funds' && (
            <div className="space-y-8">
              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sector Allocation */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <PieChartIcon className="w-5 h-5 mr-2 text-blue-600" />
                    Sector Allocation
                  </h3>
                  {mfSectorData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={mfSectorData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {mfSectorData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      No sector data available
                    </div>
                  )}
                  {/* Legend */}
                  <div className="mt-4 grid grid-cols-1 gap-2">
                    {mfSectorData.map((sector, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <span className="text-gray-700">{sector.name}</span>
                        </div>
                        <span className="text-gray-500 font-medium">{sector.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Allocation */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Risk Allocation</h3>
                  {riskData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={riskData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
                        <Tooltip formatter={(value) => [formatCurrency(value), 'Value']} />
                        <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      No risk data available
                    </div>
                  )}
                  {/* Risk Legend */}
                  <div className="mt-4 space-y-2">
                    {riskData.map((risk, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-2 ${
                            risk.name === 'Low' ? 'bg-green-500' :
                            risk.name === 'Medium' ? 'bg-yellow-500' :
                            risk.name === 'High' ? 'bg-orange-500' :
                            'bg-red-500'
                          }`}></div>
                          <span className="text-gray-700">{risk.name} Risk</span>
                        </div>
                        <span className="text-gray-500 font-medium">{risk.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AMC Allocation */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">AMC Allocation</h3>
                  {amcData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={amcData.slice(0, 5)} layout="vertical" margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                        <XAxis type="number" hide axisLine={false} tick={false} />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 13, fill: '#374151' }} axisLine={false} tickLine={false} />
                        <Bar 
                          dataKey="value" 
                          fill="#6366F1" 
                          radius={[4, 4, 4, 4]} 
                          barSize={22}
                          onMouseEnter={(data, index) => {
                            // Custom hover effect
                            const bars = document.querySelectorAll('.recharts-bar-rectangle');
                            if (bars[index]) {
                              bars[index].style.fill = '#4F46E5';
                              bars[index].style.transition = 'fill 0.2s ease';
                            }
                          }}
                          onMouseLeave={(data, index) => {
                            // Reset hover effect
                            const bars = document.querySelectorAll('.recharts-bar-rectangle');
                            if (bars[index]) {
                              bars[index].style.fill = '#6366F1';
                            }
                          }}
                        >
                          {amcData.slice(0, 5).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill="#6366F1" />
                          ))}
                        </Bar>
                        <Tooltip 
                          formatter={formatCurrency} 
                          cursor={{ fill: 'transparent' }} 
                          contentStyle={{ 
                            borderRadius: 8, 
                            fontSize: 13,
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          wrapperStyle={{ zIndex: 1000 }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-48 text-gray-500">
                      No AMC data available
                    </div>
                  )}
                  {/* Simple Legend */}
                  <div className="mt-4 space-y-1">
                    {amcData.slice(0, 5).map((amc, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 truncate">{amc.name}</span>
                        <span className="text-gray-500 font-medium">{amc.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Enhanced Holdings Table */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">Detailed Holdings</h3>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Filter className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fund Name</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">AMC</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Risk Level</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Invested</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Current</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">XIRR</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Gain/Loss</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Allocation</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {mutualFundData.map((fund, index) => {
                        const allocation = mfTotals.totalCurrent > 0 ? 
                          ((fund.CurrentValue || fund.current || 0) / mfTotals.totalCurrent * 100) : 0;
                        const gainLoss = (fund.Appreciation || fund.appreciation || 0);
                        const xirr = (fund['Annualised XIRR'] || fund.xirr || 0);
                        
                        return (
                          <tr key={index} className="hover:bg-blue-50 transition-all duration-200 group">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                  <span className="text-white font-semibold text-sm">
                                    {(fund.Scheme || fund.name || 'MF').substring(0, 2).toUpperCase()}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {fund.Scheme || fund.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Units: {(fund.UnitBal || fund.units || 0).toFixed(3)}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-900">{fund.AMCName || fund.amc || 'N/A'}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {fund.Type || fund.type || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                (() => {
                                  const fundType = fund.Type || fund.type || 'Unknown';
                                  const fundName = fund.Scheme || fund.name || '';
                                  if (fundType.includes('Index') || fundType.includes('Arbitrage') || fundType.includes('Liquid')) {
                                    return 'bg-green-100 text-green-800';
                                  } else if (fundType.includes('Bond') || fundType.includes('Debt')) {
                                    return 'bg-green-100 text-green-800';
                                  } else if (fundType.includes('Equity')) {
                                    if (fundName.includes('Small') || fundName.includes('Mid') || fundType.includes('Small') || fundType.includes('Mid')) {
                                      return 'bg-red-100 text-red-800';
                                    } else {
                                      return 'bg-orange-100 text-orange-800';
                                    }
                                  } else if (fundType.includes('Multi') || fundType.includes('Flexi')) {
                                    return 'bg-orange-100 text-orange-800';
                                  } else {
                                    return 'bg-yellow-100 text-yellow-800';
                                  }
                                })()
                              }`}>
                                {(() => {
                                  const fundType = fund.Type || fund.type || 'Unknown';
                                  const fundName = fund.Scheme || fund.name || '';
                                  if (fundType.includes('Index') || fundType.includes('Arbitrage') || fundType.includes('Liquid')) {
                                    return 'Low';
                                  } else if (fundType.includes('Bond') || fundType.includes('Debt')) {
                                    return 'Low';
                                  } else if (fundType.includes('Equity')) {
                                    if (fundName.includes('Small') || fundName.includes('Mid') || fundType.includes('Small') || fundType.includes('Mid')) {
                                      return 'Very High';
                                    } else {
                                      return 'High';
                                    }
                                  } else if (fundType.includes('Multi') || fundType.includes('Flexi')) {
                                    return 'High';
                                  } else {
                                    return 'Medium';
                                  }
                                })()}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-gray-900">
                                {formatCurrency(fund.CostValue || fund.invested || 0)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-gray-900">
                                {formatCurrency(fund.CurrentValue || fund.current || 0)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                xirr >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {xirr >= 0 ? '+' : ''}{xirr.toFixed(2)}%
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                {gainLoss >= 0 ? (
                                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                                ) : (
                                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                                )}
                                <span className={`text-sm font-medium ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatCurrency(Math.abs(gainLoss))}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                  <div 
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${allocation}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-500">{allocation.toFixed(1)}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Portfolio Insights Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Risk Analysis */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                    Risk Analysis
                  </h3>
                  <div className="space-y-4">
                    {riskData.map((risk, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full mr-3 ${
                            risk.name === 'Low' ? 'bg-green-500' :
                            risk.name === 'Medium' ? 'bg-yellow-500' :
                            risk.name === 'High' ? 'bg-orange-500' :
                            'bg-red-500'
                          }`}></div>
                          <span className="text-sm font-medium text-gray-700">{risk.name} Risk</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                risk.name === 'Low' ? 'bg-green-500' :
                                risk.name === 'Medium' ? 'bg-yellow-500' :
                                risk.name === 'High' ? 'bg-orange-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${risk.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{risk.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-900">Risk Insights</span>
                    </div>
                    <p className="text-xs text-blue-700 mt-1">
                      Your portfolio has a balanced risk distribution with {riskData.find(r => r.name === 'Low')?.percentage || 0}% in low-risk funds.
                    </p>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-green-600" />
                    Performance Metrics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Total Return</p>
                        <p className="text-xs text-gray-500">Overall portfolio performance</p>
                      </div>
                      <span className="text-lg font-bold text-green-600">
                        {mfTotals.overallReturn >= 0 ? '+' : ''}{mfTotals.overallReturn.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Absolute Gain</p>
                        <p className="text-xs text-gray-500">Total profit/loss amount</p>
                      </div>
                      <span className={`text-lg font-bold ${mfTotals.totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(Math.abs(mfTotals.totalGain))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Portfolio Value</p>
                        <p className="text-xs text-gray-500">Current total value</p>
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(mfTotals.totalCurrent)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <Target className="w-4 h-4 text-purple-600 mr-2" />
                      <span className="text-sm font-medium text-purple-900">Performance Insights</span>
                    </div>
                    <p className="text-xs text-purple-700 mt-1">
                      Your mutual fund portfolio is showing {mfTotals.overallReturn >= 0 ? 'positive' : 'negative'} returns with {mutualFundData.length} active funds.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stocks Tab */}
          {activeTab === 'stocks' && (
            <div className="space-y-8">
              {/* Enhanced Stock Holdings Table */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">Stock Holdings</h3>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Filter className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sector</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Qty</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Avg Cost</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">LTP</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Invested</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Current</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">P&L</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Net Chg</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Day Chg</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {finalStockData.map((stock, index) => {
                        const allocation = stockTotals.totalCurrent > 0 ? 
                          ((stock.current || 0) / stockTotals.totalCurrent * 100) : 0;
                        const pnl = stock.pnl || 0;
                        const netChange = stock.netChange || 0;
                        const dayChange = stock.dayChange || 0;
                        
                        return (
                          <tr key={index} className="hover:bg-blue-50 transition-all duration-200 group">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                                  <span className="text-white font-semibold text-sm">
                                    {(stock.name || 'STK').substring(0, 2).toUpperCase()}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {stock.name || 'N/A'}
                                  </div>
                                  {stock.sectorSource && (
                                    <div className="text-xs text-gray-400">Source: {stock.sectorSource}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {stock.sector || 'Unknown'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-gray-900">{stock.qty || 0}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-900">₹{(stock.avgCost || 0).toFixed(2)}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-gray-900">₹{stock.ltp || 0}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-900">{formatCurrency(stock.invested || 0)}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-gray-900">{formatCurrency(stock.current || 0)}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                {pnl >= 0 ? (
                                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                                ) : (
                                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                                )}
                                <span className={`text-sm font-medium ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatCurrency(Math.abs(pnl))}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                netChange >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {netChange >= 0 ? '+' : ''}{netChange.toFixed(2)}%
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                dayChange >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {dayChange >= 0 ? '+' : ''}{dayChange.toFixed(2)}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sector Distribution for Stocks */}
              {stockSectorData.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Sector Distribution Chart */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                      <PieChartIcon className="w-5 h-5 mr-2 text-blue-600" />
                      Sector Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={stockSectorData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {stockSectorData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Sector Legend */}
                    <div className="mt-4 grid grid-cols-1 gap-2">
                      {stockSectorData.map((sector, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            <span className="text-gray-700">{sector.name}</span>
                          </div>
                          <span className="text-gray-500 font-medium">{sector.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sector Allocation with Progress Bars */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                      Sector Allocation
                    </h3>
                    <div className="space-y-4">
                      {stockSectorData.map((sector, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">{sector.name}</span>
                            <span className="text-sm text-gray-500">{formatCurrency(sector.value)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="h-3 rounded-full transition-all duration-500 ease-out"
                              style={{ 
                                width: `${sector.percentage}%`,
                                backgroundColor: COLORS[index % COLORS.length]
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{sector.count} stocks</span>
                            <span>{sector.percentage}% of portfolio</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-900">Sector Insights</span>
                      </div>
                      <p className="text-xs text-blue-700 mt-1">
                        Your stock portfolio is diversified across {stockSectorData.length} sectors with {finalStockData.length} total holdings.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stock Performance Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Performers */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                    Top Performers
                  </h3>
                  <div className="space-y-3">
                    {finalStockData
                      .filter(stock => (stock.pnl || 0) > 0)
                      .sort((a, b) => (b.pnl || 0) - (a.pnl || 0))
                      .slice(0, 5)
                      .map((stock, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-green-600 font-semibold text-xs">{index + 1}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{stock.name}</p>
                              <p className="text-xs text-gray-500">{stock.sector || 'Unknown'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-green-600">
                              +{formatCurrency(stock.pnl || 0)}
                            </p>
                            <p className="text-xs text-green-500">
                              +{(stock.netChange || 0).toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Underperformers */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <TrendingDown className="w-5 h-5 mr-2 text-red-600" />
                    Underperformers
                  </h3>
                  <div className="space-y-3">
                    {finalStockData
                      .filter(stock => (stock.pnl || 0) < 0)
                      .sort((a, b) => (a.pnl || 0) - (b.pnl || 0))
                      .slice(0, 5)
                      .map((stock, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-red-600 font-semibold text-xs">{index + 1}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{stock.name}</p>
                              <p className="text-xs text-gray-500">{stock.sector || 'Unknown'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-red-600">
                              {formatCurrency(stock.pnl || 0)}
                            </p>
                            <p className="text-xs text-red-500">
                              {(stock.netChange || 0).toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioDashboard; 