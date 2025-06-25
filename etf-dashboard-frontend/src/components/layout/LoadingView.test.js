import { render, screen } from '@testing-library/react';
import LoadingView from './LoadingView';

describe('LoadingView', () => {
  it('renders loading indicator', () => {
    render(<LoadingView />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
}); 