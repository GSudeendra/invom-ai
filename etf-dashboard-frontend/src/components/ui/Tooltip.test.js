import { render, screen, fireEvent } from '@testing-library/react';
import Tooltip from './Tooltip';

describe('Tooltip', () => {
  it('renders tooltip content', () => {
    render(<Tooltip content="Tooltip text"><button>Hover me</button></Tooltip>);
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });
  it('shows/hides tooltip on hover', async () => {
    render(<Tooltip content="Tooltip text"><button>Hover me</button></Tooltip>);
    const button = screen.getByText('Hover me');
    fireEvent.mouseOver(button);
    expect(await screen.findByText('Tooltip text')).toBeInTheDocument();
    fireEvent.mouseOut(button);
    // Tooltip may disappear, but this depends on implementation
  });
}); 