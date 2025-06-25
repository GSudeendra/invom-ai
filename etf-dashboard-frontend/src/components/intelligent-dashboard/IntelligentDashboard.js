import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { ETFCategorizer } from '../../utils/etfCategorizer';
import EnhancedETFCard from '../enhanced-dashboard/EnhancedETFCard';
import Header from '../layout/Header';
import LoadingView from '../layout/LoadingView';
import ErrorView from '../layout/ErrorView';
import { formatPrice, formatPercent } from '../../utils/format';
// AI Predictions
import PredictionChart from './ai-predictions/PredictionChart';
import ConfidenceInterval from './ai-predictions/ConfidenceInterval';
import ModelAccuracy from './ai-predictions/ModelAccuracy';
import PredictionHistory from './ai-predictions/PredictionHistory';
import VolatilityForecast from './ai-predictions/VolatilityForecast';
import TrendPrediction from './ai-predictions/TrendPrediction';
import MarketRegime from './ai-predictions/MarketRegime';
// Sentiment
import SentimentDashboard from './sentiment/SentimentDashboard';
import NewsSentiment from './sentiment/NewsSentiment';
import SocialSentiment from './sentiment/SocialSentiment';
import SentimentTrends from './sentiment/SentimentTrends';
import SentimentAlerts from './sentiment/SentimentAlerts';
import SentimentCorrelation from './sentiment/SentimentCorrelation';
// AI Strategies
import StrategyGenerator from './ai-strategies/StrategyGenerator';
import StrategyOptimizer from './ai-strategies/StrategyOptimizer';
import EnsembleStrategies from './ai-strategies/EnsembleStrategies';
import StrategyPerformance from './ai-strategies/StrategyPerformance';
import RiskAdjustment from './ai-strategies/RiskAdjustment';
import AdaptiveStrategy from './ai-strategies/AdaptiveStrategy';
// Alternative Data
import EconomicIndicators from './alternative-data/EconomicIndicators';
import SatelliteData from './alternative-data/SatelliteData';
import SocialTrends from './alternative-data/SocialTrends';
import CorporateEvents from './alternative-data/CorporateEvents';
import SupplyChainData from './alternative-data/SupplyChainData';
import MacroFactors from './alternative-data/MacroFactors';
// Advanced Analytics
import CorrelationMatrix from './advanced-analytics/CorrelationMatrix';
import FactorAnalysis from './advanced-analytics/FactorAnalysis';
import MonteCarloSimulation from './advanced-analytics/MonteCarloSimulation';
import RiskAttribution from './advanced-analytics/RiskAttribution';
import PerformanceAttribution from './advanced-analytics/PerformanceAttribution';
import ScenarioAnalysis from './advanced-analytics/ScenarioAnalysis';
import StressTest from './advanced-analytics/StressTest';
// AI Assistants
import TradingAssistant from './ai-assistants/TradingAssistant';
import ResearchAssistant from './ai-assistants/ResearchAssistant';
import RiskAssistant from './ai-assistants/RiskAssistant';
import ChatInterface from './ai-assistants/ChatInterface';
import VoiceInterface from './ai-assistants/VoiceInterface';
import AssistantHistory from './ai-assistants/AssistantHistory';

const IntelligentDashboard = () => {
  const [etfData, setEtfData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('dayChange');
  const [sortOrder, setSortOrder] = useState('desc');
  const [tab, setTab] = useState('ai-predictions');
  const { showToast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch all categories
      const catRes = await fetch('/api/categories');
      const catJson = await catRes.json();
      const categories = catJson.data || catJson;
      let allEtfs = [];
      for (const cat of categories) {
        const etfRes = await fetch(`/api/etfs/category/${cat.key}`);
        const etfJson = await etfRes.json();
        const etfData = etfJson.data || etfJson;
        if (etfData.funds) allEtfs = allEtfs.concat(etfData.funds);
      }
      // Add smart category
      const withSmartCat = allEtfs.map(etf => ({
        ...etf,
        smartCategory: ETFCategorizer.categorizeETF(etf.schemeName, etf.assets).category
      }));
      setEtfData(withSmartCat);
      showToast('Data loaded successfully', 'success');
    } catch (error) {
      showToast('Failed to load intelligent dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const processedETFs = useMemo(() => {
    let filtered = etfData;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(etf => etf.smartCategory === selectedCategory);
    }
    if (searchTerm) {
      filtered = filtered.filter(etf =>
        (etf.schemeName && etf.schemeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (etf.symbol && etf.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    filtered = [...filtered].sort((a, b) => {
      const aVal = a[sortBy] || 0;
      const bVal = b[sortBy] || 0;
      return (parseFloat(bVal) - parseFloat(aVal)) * (sortOrder === 'desc' ? 1 : -1);
    });
    return filtered;
  }, [etfData, selectedCategory, searchTerm, sortBy, sortOrder]);

  let tabContent;
  if (tab === 'ai-predictions') {
    tabContent = (
      <div style={{ display: 'grid', gap: 24 }}>
        <PredictionChart />
        <ConfidenceInterval />
        <ModelAccuracy />
        <PredictionHistory />
        <VolatilityForecast />
        <TrendPrediction />
        <MarketRegime />
      </div>
    );
  } else if (tab === 'sentiment') {
    tabContent = (
      <div style={{ display: 'grid', gap: 24 }}>
        <SentimentDashboard />
        <NewsSentiment />
        <SocialSentiment />
        <SentimentTrends />
        <SentimentAlerts />
        <SentimentCorrelation />
      </div>
    );
  } else if (tab === 'ai-strategies') {
    tabContent = (
      <div style={{ display: 'grid', gap: 24 }}>
        <StrategyGenerator />
        <StrategyOptimizer />
        <EnsembleStrategies />
        <StrategyPerformance />
        <RiskAdjustment />
        <AdaptiveStrategy />
      </div>
    );
  } else if (tab === 'alternative-data') {
    tabContent = (
      <div style={{ display: 'grid', gap: 24 }}>
        <EconomicIndicators />
        <SatelliteData />
        <SocialTrends />
        <CorporateEvents />
        <SupplyChainData />
        <MacroFactors />
      </div>
    );
  } else if (tab === 'analytics') {
    tabContent = (
      <div style={{ display: 'grid', gap: 24 }}>
        <CorrelationMatrix />
        <FactorAnalysis />
        <MonteCarloSimulation />
        <RiskAttribution />
        <PerformanceAttribution />
        <ScenarioAnalysis />
        <StressTest />
      </div>
    );
  } else if (tab === 'assistants') {
    tabContent = (
      <div style={{ display: 'grid', gap: 24 }}>
        <TradingAssistant />
        <ResearchAssistant />
        <RiskAssistant />
        <ChatInterface />
        <VoiceInterface />
        <AssistantHistory />
      </div>
    );
  } else {
    tabContent = <div style={{ padding: 32, color: '#888' }}>Coming soon.</div>;
  }

  if (loading) {
    return (
      <div className="dashboard-main">
        <Header title="Intelligent ETF Dashboard" subtitle="Smart categorization • Live + Historical data • Advanced analytics" />
        <LoadingView message="Loading intelligent analysis..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-main">
        <Header title="Intelligent ETF Dashboard" subtitle="Smart categorization • Live + Historical data • Advanced analytics" />
        <ErrorView error={error} onRetry={fetchData} />
      </div>
    );
  }

  return (
    <div className="intelligent-dashboard" style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>🧠 Intelligent ETF Dashboard</h1>
      <div className="intelligent-tabs" style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {TABS.map(t => (
          <button
            key={t.key}
            className={`intelligent-tab${tab === t.key ? ' active' : ''}`}
            style={{
              padding: '8px 20px',
              border: 'none',
              borderRadius: 6,
              background: tab === t.key ? '#6366F1' : '#f3f4f6',
              color: tab === t.key ? '#fff' : '#222',
              fontWeight: 600,
              fontSize: 15,
              cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s'
            }}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabContent}
    </div>
  );
};

const TABS = [
  { key: 'ai-predictions', label: 'AI Predictions' },
  { key: 'sentiment', label: 'Sentiment' },
  { key: 'ai-strategies', label: 'AI Strategies' },
  { key: 'alternative-data', label: 'Alternative Data' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'assistants', label: 'AI Assistants' }
];

export default IntelligentDashboard;
