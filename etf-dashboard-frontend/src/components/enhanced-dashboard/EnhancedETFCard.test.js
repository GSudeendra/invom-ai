import { render, screen, fireEvent } from '@testing-library/react';
import EnhancedETFCard from './EnhancedETFCard';
import { ToastProvider } from '../../contexts/ToastContext';

describe('EnhancedETFCard', () => {
  const etf = {
    schemeName: 'Test ETF',
    latestNav: 123.45,
    navDate: '2024-06-22',
    signal: 'BUY',
    rsi: 30,
    sma: 120,
    macd: 1.2,
    boll: { upper: 130, middle: 120, lower: 110 }
  };
  it('renders ETF details', () => {
    render(<ToastProvider><EnhancedETFCard etf={etf} /></ToastProvider>);
    expect(screen.getByText('Test ETF')).toBeInTheDocument();
    expect(screen.getByText(/123.45/)).toBeInTheDocument();
  });
  it('calls onClick when card is clicked', () => {
    const onClick = jest.fn();
    render(<ToastProvider><EnhancedETFCard etf={etf} onClick={onClick} /></ToastProvider>);
    fireEvent.click(screen.getByText('View Details'));
    expect(onClick).toHaveBeenCalled();
  });
  it('renders buy/sell/hold signal', () => {
    render(<ToastProvider><EnhancedETFCard etf={{ ...etf, signal: 'SELL' }} /></ToastProvider>);
    expect(screen.getByText(/sell/i)).toBeInTheDocument();
  });
}); 