import { render, screen } from '@testing-library/react';
import Navigation from './Navigation';
import { MemoryRouter } from 'react-router-dom';

describe('Navigation', () => {
  it('renders navigation links', () => {
    render(<MemoryRouter><Navigation /></MemoryRouter>);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    // You can check for specific links if known
  });
}); 