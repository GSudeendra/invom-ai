import { render, screen, fireEvent } from '@testing-library/react';
import Toast from './Toast';

describe('Toast', () => {
  it('renders toast message', () => {
    render(<Toast message="Test message" onClose={() => {}} />);
    expect(screen.getByText(/Test message/i)).toBeInTheDocument();
  });
  it('calls onClose when close button is clicked', async () => {
    const onClose = jest.fn();
    render(<Toast message="Test message" onClose={onClose} />);
    const button = await screen.findByRole('button');
    fireEvent.click(button);
    setTimeout(() => {
      expect(onClose).toHaveBeenCalled();
    }, 350);
  });
}); 