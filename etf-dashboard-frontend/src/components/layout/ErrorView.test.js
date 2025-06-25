import { render, screen } from '@testing-library/react';
import ErrorView from './ErrorView';

describe('ErrorView', () => {
  it('renders error message', () => {
    render(<ErrorView message="Something went wrong" />);
    expect(screen.getByText(/error loading data/i)).toBeInTheDocument();
  });
  it('handles missing message gracefully', () => {
    render(<ErrorView />);
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
}); 