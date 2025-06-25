import React, { useState, useMemo, useEffect } from 'react';
import { useEnhancedETFs } from '../../hooks/useEnhancedETFs';
import ETFGrid from '../basic-dashboard/ETFGrid';
import Header from '../layout/Header';
import DashboardControls from '../basic-dashboard/DashboardControls';
import AlertCenter from './alerts/AlertCenter';
import ScreeningPage from './screening/ScreeningPage';
import PortfolioOverview from './portfolio/PortfolioOverview';
import HoldingsTable from './portfolio/HoldingsTable';
import TechnicalChart from './swing-trading/TechnicalChart';
import IndicatorPanel from './swing-trading/IndicatorPanel';
import { useToast } from '../../contexts/ToastContext';
import { fetchEnhancedEtfs, fetchLiveEtfs } from '../../api/etfApi';
import { fetchMFIndiaData } from '../../api/enhancedEtfApi';
import { DataTransformer } from '../../utils/dataTransformer';
import './EnhancedDashboardPage.css';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Navigation from '../layout/Navigation';
import CategoryFilter from '../common/CategoryFilter';
import SearchBar from '../common/SearchBar';
import ETFCard from '../common/ETFCard';
import Skeleton from '../ui/Skeleton';
import Toast from '../ui/Toast';
import useCategories from '../../hooks/useCategories';
import useEtfsByCategory from '../../hooks/useEtfsByCategory';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'screening', label: 'Screening' },
  { key: 'portfolio', label: 'Portfolio' },
  { key: 'technical', label: 'Technical Analysis' },
  { key: 'alerts', label: 'Alerts' }
];

// Mock portfolio data for now
const MOCK_PORTFOLIO = {
  totalValue: 1250000,
  positions: [
    { symbol: 'NIFTY50', name: 'Nifty 50 ETF', quantity: 100, avgPrice: 210, currentPrice: 215, pnl: 500 },
    { symbol: 'GOLDBEES', name: 'Gold ETF', quantity: 50, avgPrice: 45, currentPrice: 46, pnl: 50 }
  ],
  allocation: [
    { label: 'Nifty 50 ETF', value: 70 },
    { label: 'Gold ETF', value: 30 }
  ],
  riskMetrics: {
    sharpe: 1.12,
    maxDrawdown: 0.08,
    beta: 0.95,
    volatility: 0.13,
    stddev: 0.12,
    cvar: 0.09
  },
  performance: [
    { date: '2024-06-01', value: 1200000 },
    { date: '2024-06-10', value: 1220000 },
    { date: '2024-06-20', value: 1240000 },
    { date: '2024-06-24', value: 1250000 }
  ]
};

export default function EnhancedDashboardPage({ mode, setMode }) {
  const { categories, loading: catLoading, error: catError } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', type: 'info' });

  // Default to first category when loaded
  React.useEffect(() => {
    if (!selectedCategory && categories && categories.length > 0) {
      setSelectedCategory(categories[0].key);
    }
  }, [categories, selectedCategory]);

  // Fetch ETFs for selected category
  const { etfs, loading, error } = useEtfsByCategory(selectedCategory);

  // Filter ETFs by search term
  const filteredEtfs = useMemo(() => {
    if (!etfs) return [];
    if (!searchTerm) return etfs;
    const term = searchTerm.toLowerCase();
    return etfs.filter(etf =>
      (etf.schemeName && etf.schemeName.toLowerCase().includes(term)) ||
      (etf.symbol && etf.symbol.toLowerCase().includes(term))
    );
  }, [etfs, searchTerm]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navigation />
      <Box sx={{ flex: 1, ml: { xs: 0, md: '280px' }, p: { xs: 2, md: 4 } }}>
        <Header mode={mode} setMode={setMode} />
        <Container maxWidth="xl">
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
            loading={catLoading}
          />
          <SearchBar value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <Grid container spacing={3}>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                    <Skeleton height={180} />
                  </Grid>
                ))
              : filteredEtfs.map(etf => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={etf.symbol}>
                    <ETFCard
                      etf={etf}
                      onAddWatchlist={() => setToast({ open: true, message: 'Added to watchlist', type: 'success' })}
                      onDetails={() => setToast({ open: true, message: 'ETF details coming soon', type: 'info' })}
                    />
                  </Grid>
                ))}
          </Grid>
        </Container>
        <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, open: false })} />
      </Box>
    </Box>
  );
}
