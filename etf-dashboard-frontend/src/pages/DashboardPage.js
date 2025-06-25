import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import ETFCard from '../components/etf/ETFCard';
import FilterBar from '../components/etf/Filters';
import ETFGrid from '../components/etf/ETFGrid';
import useCategories from '../hooks/useCategories';
import useEtfsByCategory from '../hooks/useEtfsByCategory';
import { ETFCardSkeleton, StatsCardSkeleton, FilterBarSkeleton } from '../components/ui/LoadingSkeleton';
import { ErrorState, EmptyState } from '../components/ui/ErrorState';
import { BarChart3, TrendingUp, RotateCcw, Grid, List } from 'lucide-react';
import { fetchLiveEtfs } from '../api/etfApi';
import { formatPrice, formatPercent, formatVolume, formatCurrency } from '../utils/format';

const StatsCard = ({ title, value, change, icon: Icon, subtitle }) => (
  <div className="card p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {change && (
          <p className={`text-sm mt-1 ${change.startsWith('+') ? 'text-success-600' : 'text-danger-600'}`}>{change}</p>
        )}
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      <div className="p-3 bg-primary-50 rounded-full">
        <Icon className="w-6 h-6 text-primary-600" />
      </div>
    </div>
  </div>
);

// Category keywords mapping for live filtering
const CATEGORY_KEYWORDS = {
  nifty50: ['nifty 50', 'niftybees', 'niftyetf', 'nifty bees'],
  banking: ['bank', 'banking', 'bankbees', 'nifty bank'],
  largeCap: ['largecap', 'top 100', 'nifty 100'],
  midCap: ['midcap', 'midcap 150', 'juniorbees'],
  smallCap: ['smallcap', 'small cap 250'],
  it: ['it', 'tech', 'nifty it', 'itbees'],
  sensex: ['sensex'],
  gold: ['gold', 'goldbees'],
  silver: ['silver', 'silverbees'],
  next50: ['nifty next 50', 'juniorbees'],
  liquid: ['liquid', 'liquidbees'],
  international: ['nasdaq', 'sp 500', 'international', 'global'],
  consumption: ['consumption', 'consumer'],
  healthcare: ['healthcare', 'pharma'],
  gilt: ['gsec', 'gilt', 'government bond'],
  momentum: ['momentum'],
  value: ['value'],
  quality: ['quality'],
  infrastructure: ['infra', 'infrastructure'],
  lowVolatility: ['low vol', 'lowvol'],
  equalWeight: ['equal weight', 'equalo'],
  metals: ['metal'],
  misc: [],
};

function filterLiveEtfsByCategory(liveEtfs, selectedCategory) {
  const keywords = CATEGORY_KEYWORDS[selectedCategory] || [];
  if (!keywords.length) return liveEtfs;
  return liveEtfs.filter(etf => {
    const name = ((etf.assets || '') + ' ' + (etf.symbol || '')).toLowerCase();
    return keywords.some(keyword => name.includes(keyword));
  });
}

const LiveDataIndicator = ({ timestamp, isConnected }) => (
  <div className="flex items-center gap-2 text-sm">
    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success-500 animate-pulse' : 'bg-gray-400'}`}></div>
    <span className="text-gray-600">
      {isConnected ? 'Live Data' : 'Connecting...'}
    </span>
    {timestamp && (
      <span className="text-gray-500">
        • {new Date(timestamp).toLocaleTimeString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        })}
      </span>
    )}
  </div>
);

export default function DashboardPage() {
  const { categories, loading: catLoading, error: catError, refetch: refetchCategories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState('');
  const { etfs, loading: etfLoading, error: etfError, refetch: refetchEtfs } = useEtfsByCategory(selectedCategory);
  const [viewMode, setViewMode] = useState('grid');
  const [liveMode, setLiveMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecommendation, setSelectedRecommendation] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All');

  // Live data state
  const [liveEtfs, setLiveEtfs] = useState([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);

  // Add timestamp state for live data
  const [liveTimestamp, setLiveTimestamp] = useState(null);

  // Set default category when categories load
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].key);
    }
  }, [categories, selectedCategory]);

  // Fetch live ETF data when live mode is enabled
  useEffect(() => {
    if (!liveMode) {
      setLiveEtfs([]);
      setLiveError(null);
      setLiveTimestamp(null);
      return;
    }

    const fetchLiveData = async () => {
      setLiveLoading(true);
      setLiveError(null);
      try {
        const data = await fetchLiveEtfs();
        console.log('Live ETF data received:', data);
        console.log('First ETF sample:', data.data?.[0]);
        setLiveEtfs(data.data || []);
        setLiveTimestamp(data.timestamp || new Date().toISOString());
      } catch (err) {
        console.error('Error fetching live ETF data:', err);
        setLiveError(err.message || 'Failed to fetch live ETF data');
      } finally {
        setLiveLoading(false);
      }
    };

    fetchLiveData();
  }, [liveMode]);

  // Get the appropriate data source
  const dataSource = liveMode ? liveEtfs : etfs;
  const dataLoading = liveMode ? liveLoading : etfLoading;
  const dataError = liveMode ? liveError : etfError;

  // Filter live ETFs by category if in live mode
  const categoryFilteredData = liveMode 
    ? filterLiveEtfsByCategory(dataSource, selectedCategory)
    : dataSource;

  // Filtering logic (search, price, recommendation)
  const filteredEtfs = (categoryFilteredData || []).filter(etf => {
    const name = liveMode 
      ? (etf.assets || etf.symbol || '')
      : (etf.schemeName || etf.name || '');
    const nav = liveMode 
      ? parseFloat(etf.ltP || 0)
      : parseFloat(etf.latestNav || etf.nav || 0);
    
    let matches = name.toLowerCase().includes(searchTerm.toLowerCase());
    if (selectedPriceRange === 'lt100') matches = matches && nav < 100;
    if (selectedPriceRange === '100-500') matches = matches && nav >= 100 && nav <= 500;
    if (selectedPriceRange === 'gt500') matches = matches && nav > 500;
    return matches;
  });

  const handleRefreshData = () => {
    refetchCategories();
    if (selectedCategory) {
      refetchEtfs();
    }
    if (liveMode) {
      // Re-fetch live data
      setLiveLoading(true);
      fetchLiveEtfs()
        .then(data => setLiveEtfs(data.data || []))
        .catch(err => setLiveError(err.message || 'Failed to fetch live ETF data'))
        .finally(() => setLiveLoading(false));
    }
  };

  // Calculate enhanced stats for live mode
  const calculateLiveStats = () => {
    if (!liveMode || !liveEtfs.length) return {};
    
    const totalVolume = liveEtfs.reduce((sum, etf) => sum + (parseInt(etf.qty) || 0), 0);
    const totalTradeValue = liveEtfs.reduce((sum, etf) => sum + (parseFloat(etf.trdVal) || 0), 0);
    
    const changes = liveEtfs
      .map(etf => {
        const change = parseFloat(etf.per);
        return isNaN(change) ? 0 : change;
      })
      .filter(change => change !== 0);
    
    const avgChange = changes.length > 0 ? changes.reduce((sum, change) => sum + change, 0) / changes.length : 0;
    const positiveCount = changes.filter(change => change > 0).length;
    const negativeCount = changes.filter(change => change < 0).length;
    
    const prices = liveEtfs
      .map(etf => parseFloat(etf.ltP))
      .filter(price => !isNaN(price));
    
    const avgPrice = prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0;
    
    return {
      totalVolume,
      totalTradeValue,
      avgChange,
      positiveCount,
      negativeCount,
      avgPrice,
      totalEtfs: liveEtfs.length
    };
  };

  const liveStats = calculateLiveStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header liveMode={liveMode} />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {catLoading ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <StatsCard 
                title="Total ETFs" 
                value={filteredEtfs.length.toString()} 
                change={liveMode ? `${liveStats.totalEtfs} live` : "+5 this week"}
                subtitle={liveMode ? "Active in market" : "Cached data"}
                icon={BarChart3}
              />
              <StatsCard 
                title={liveMode ? "Avg Price" : "Avg NAV"} 
                value={liveMode ? formatPrice(liveStats.avgPrice) : formatPrice(filteredEtfs.reduce((sum, etf) => sum + (parseFloat(etf.latestNav || etf.ltP || 0) || 0), 0) / Math.max(filteredEtfs.length, 1))}
                change={liveMode ? `${liveStats.avgChange >= 0 ? '+' : ''}${formatPercent(liveStats.avgChange)}` : "+2.3% today"}
                subtitle={liveMode ? "Market average" : "Cached average"}
                icon={TrendingUp}
              />
              <StatsCard 
                title={liveMode ? "Market Sentiment" : "Categories"} 
                value={liveMode ? `${liveStats.positiveCount}/${liveStats.negativeCount}` : categories.length.toString()} 
                change={liveMode ? `${liveStats.positiveCount > liveStats.negativeCount ? 'Bullish' : 'Bearish'}` : "Active"}
                subtitle={liveMode ? "Gainers/Losers" : "Available categories"}
                icon={BarChart3}
              />
              <StatsCard 
                title={liveMode ? "Total Volume" : "Live Data"} 
                value={liveMode ? formatVolume(liveStats.totalVolume) : (liveMode ? "Connected" : "Cached")} 
                change={liveMode ? formatCurrency(liveStats.totalTradeValue) : (liveMode ? "Real-time" : "Last updated")}
                subtitle={liveMode ? "Units traded" : "Data source"}
                icon={TrendingUp}
              />
            </>
          )}
        </div>

        {/* Market Activity Summary (Live Mode Only) */}
        {liveMode && liveEtfs.length > 0 && (
          <div className="card p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Activity Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {liveStats.positiveCount}
                </div>
                <div className="text-sm text-success-600 font-medium">Gainers</div>
                <div className="text-xs text-gray-500">
                  {liveStats.totalEtfs > 0 ? `${((liveStats.positiveCount / liveStats.totalEtfs) * 100).toFixed(1)}%` : '0%'} of total
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {liveStats.negativeCount}
                </div>
                <div className="text-sm text-danger-600 font-medium">Losers</div>
                <div className="text-xs text-gray-500">
                  {liveStats.totalEtfs > 0 ? `${((liveStats.negativeCount / liveStats.totalEtfs) * 100).toFixed(1)}%` : '0%'} of total
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatVolume(liveStats.totalVolume)}
                </div>
                <div className="text-sm text-gray-600 font-medium">Total Volume</div>
                <div className="text-xs text-gray-500">
                  Units traded today
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(liveStats.totalTradeValue)}
                </div>
                <div className="text-sm text-gray-600 font-medium">Trade Value</div>
                <div className="text-xs text-gray-500">
                  Total value traded
                </div>
              </div>
            </div>
            
            {/* Market Sentiment Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Market Sentiment</span>
                <span>{liveStats.positiveCount > liveStats.negativeCount ? 'Bullish' : 'Bearish'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-danger-500 to-success-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${liveStats.totalEtfs > 0 ? (liveStats.positiveCount / liveStats.totalEtfs) * 100 : 50}%` 
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Bearish ({liveStats.negativeCount})</span>
                <span>Bullish ({liveStats.positiveCount})</span>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="card p-6 mb-8">
          {catLoading ? (
            <FilterBarSkeleton />
          ) : catError ? (
            <ErrorState error={catError} onRetry={refetchCategories} title="Failed to load categories" />
          ) : (
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <FilterBar
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  category={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  categoryOptions={categories.map(cat => ({ value: cat.key, label: cat.label }))}
                  recommendation={selectedRecommendation}
                  onRecommendationChange={setSelectedRecommendation}
                  price={selectedPriceRange}
                  onPriceChange={setSelectedPriceRange}
                />
              </div>
              
              <div className="flex items-center gap-4">
                {/* Live Toggle */}
                <div className="flex items-center gap-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={liveMode}
                      onChange={() => setLiveMode(!liveMode)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">
                      {liveMode ? 'Live Data' : 'Cached Data'}
                    </span>
                    {liveMode && (
                      <LiveDataIndicator 
                        timestamp={liveTimestamp} 
                        isConnected={!liveLoading && !liveError} 
                      />
                    )}
                  </div>
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>

                {/* Refresh Button */}
                <button
                  onClick={handleRefreshData}
                  disabled={catLoading || dataLoading}
                  className="btn btn-secondary text-sm"
                >
                  {catLoading || dataLoading ? 'Refreshing...' : 'Refresh Data'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Link to="/stats" className="btn btn-primary">
            📈 View All Statistics
          </Link>
          <Link to="/analytics" className="btn btn-success">
            📊 Advanced Analytics
          </Link>
          <button className="btn btn-warning">
            🔄 Compare ETFs
          </button>
        </div>

        {/* ETF Grid */}
        {dataLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <ETFCardSkeleton key={i} />
            ))}
          </div>
        ) : dataError ? (
          <ErrorState error={dataError} onRetry={() => window.location.reload()} />
        ) : filteredEtfs.length === 0 ? (
          <EmptyState 
            message="No ETFs found" 
            description="Try adjusting your filters or search terms."
          />
        ) : (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {filteredEtfs.map(etf => (
              <ETFCard
                key={liveMode ? etf.symbol : (etf.amfiCode || etf.symbol || etf.schemeName)}
                etf={etf}
                liveMode={liveMode}
                liveData={liveMode ? etf : null}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 