import { render, screen, fireEvent } from '@testing-library/react';
import BasicETFCard from './BasicETFCard';

// Mock useLiveETFData to return the expected data immediately
jest.mock('../../hooks/useLiveETFData', () => () => ({
  data: {
    schemeName: 'Test ETF',
    symbol: 'TEST',
    lastPrice: 123.45,
    changePercent: 1.23,
    previousClose: 122.22,
    volume: 10000,
    fundHouse: 'Test Fund'
  },
  loading: false,
  error: null
}));

describe('BasicETFCard', () => {
  const etf = {
    schemeName: 'Test ETF',
    symbol: 'TEST',
    latestNav: 123.45,
    dailyChangePercent: 1.23,
    prevClose: 122.22,
    volume: 10000,
    fundHouse: 'Test Fund'
  };
  it('renders ETF details', () => {
    render(<BasicETFCard etf={etf} isInWatchlist={false} onToggleWatchlist={() => {}} />);
    expect(screen.getByText('Test ETF')).toBeInTheDocument();
    expect(screen.getByText('TEST')).toBeInTheDocument();
    expect(screen.getByText('₹123.45')).toBeInTheDocument();
    expect(screen.getByText('1.23%')).toBeInTheDocument();
    expect(screen.getByText('₹122.22')).toBeInTheDocument();
    expect(screen.getByText('10,000')).toBeInTheDocument();
    expect(screen.getByText('Test Fund')).toBeInTheDocument();
  });
  it('toggles watchlist button', () => {
    const onToggle = jest.fn();
    render(<BasicETFCard etf={etf} isInWatchlist={false} onToggleWatchlist={onToggle} />);
    fireEvent.click(screen.getByText('Add to Watchlist'));
    expect(onToggle).toHaveBeenCalled();
  });
}); 