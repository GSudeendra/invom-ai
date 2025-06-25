import { render, screen, fireEvent } from '@testing-library/react';
import Filters from './Filters';

// This test file covers requirements from backend/FUNCTIONALITY.md section: Modern React Frontend, Category Filtering

describe('Filters', () => {
  it('renders filter controls', () => {
    render(<Filters onCategoryChange={() => {}} category="large-cap" categoryOptions={[
      { value: 'large-cap', label: 'Large Cap' },
      { value: 'mid-cap', label: 'Mid Cap' }
    ]} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Large Cap')).toBeInTheDocument();
    expect(screen.getByText('Mid Cap')).toBeInTheDocument();
  });
  it('calls onCategoryChange when filter is changed', () => {
    const onCategoryChange = jest.fn();
    render(<Filters onCategoryChange={onCategoryChange} category="large-cap" categoryOptions={[
      { value: 'large-cap', label: 'Large Cap' },
      { value: 'mid-cap', label: 'Mid Cap' }
    ]} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'mid-cap' } });
    expect(onCategoryChange).toHaveBeenCalledWith('mid-cap');
  });
}); 