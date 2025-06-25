import { render, screen } from '@testing-library/react';
import ETFDetailView from './ETFDetailView';
import { formatDate } from '../../utils/format';

describe('ETFDetailView', () => {
  const etf = {
    schemeName: 'Test ETF',
    latestNav: 123.45,
    navDate: '2024-06-22T05:30:00.000Z',
    rsi: 30,
    smaCrossover: 'bullish',
    volatility: 12.5,
    volatilityTag: 'medium',
    dailyChangePercent: 0.5,
    weeklyChangePercent: 1.2,
    category: 'Large Cap',
    fundHouse: 'Test Fund',
    amfiCode: '123456',
    historicalPrices: [120, 121, 122, 123, 124, 125],
  };
  it('renders ETF details', () => {
    render(<ETFDetailView etf={etf} />);
    expect(screen.getByText('Test ETF')).toBeInTheDocument();
    expect(screen.getByText(/123.45/)).toBeInTheDocument();
    expect(screen.getByText(formatDate(etf.navDate))).toBeInTheDocument();
  });
  it('renders technical indicators', () => {
    render(<ETFDetailView etf={etf} />);
    expect(screen.getByText(/RSI/i)).toBeInTheDocument();
    expect(screen.getByText(/SMA Crossover/i)).toBeInTheDocument();
    expect(screen.getByText(/Volatility/i)).toBeInTheDocument();
  });
  it('handles missing data gracefully', () => {
    render(<ETFDetailView etf={{}} />);
    // Should not throw, but will render empty fields; no 'No ETF data' text
    expect(screen.getByText('NAV:')).toBeInTheDocument();
  });
}); 