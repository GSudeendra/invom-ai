import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('Header', () => {
  it('renders logo and navigation', () => {
    render(<Header />);
    expect(screen.getByText(/indian etf dashboard 2025/i)).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
  it('renders avatar if present', () => {
    render(<Header avatarUrl="/avatar-placeholder.png" />);
    expect(screen.getByAltText(/avatar/i)).toBeInTheDocument();
  });
}); 