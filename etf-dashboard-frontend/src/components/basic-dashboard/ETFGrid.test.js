import { render, screen, fireEvent } from '@testing-library/react';
import ETFGrid from './ETFGrid';
import { ToastProvider } from '../../contexts/ToastContext';

describe('ETFGrid', () => {
  const etfs = [
    { schemeName: 'ETF 1', latestNav: 100 },
    { schemeName: 'ETF 2', latestNav: 200 }
  ];
  it('renders a grid of ETF cards', () => {
    render(
      <ToastProvider>
        <ETFGrid etfs={etfs} onCardClick={() => {}} />
      </ToastProvider>
    );
    expect(screen.getByText('ETF 1')).toBeInTheDocument();
    expect(screen.getByText('ETF 2')).toBeInTheDocument();
  });
  it('handles empty ETF list gracefully', () => {
    render(
      <ToastProvider>
        <ETFGrid etfs={[]} onCardClick={() => {}} />
      </ToastProvider>
    );
    expect(screen.getByText(/No Large Cap ETFs Available/i)).toBeInTheDocument();
    expect(screen.getByText(/no etfs in the large cap category/i)).toBeInTheDocument();
  });
  it('calls onCardClick when a card is clicked', () => {
    const onCardClick = jest.fn();
    render(
      <ToastProvider>
        <ETFGrid etfs={etfs} onCardClick={onCardClick} />
      </ToastProvider>
    );
    // Click the "View Details" button for the first ETF
    const viewDetailsButton = screen.getAllByText('View Details')[0];
    fireEvent.click(viewDetailsButton);
    expect(onCardClick).toHaveBeenCalled();
  });
}); 