import { render, screen, fireEvent } from '@testing-library/react';
import DashboardControls from './DashboardControls';

// This test file covers requirements from backend/FUNCTIONALITY.md section: Modern React Frontend, Category Filtering, User Flow

describe('DashboardControls', () => {
  const categoryOptions = [
    { value: 'large-cap', label: 'Large Cap' },
    { value: 'nifty50', label: 'Nifty 50' }
  ];
  const sortOptions = [
    { value: 'nav', label: 'NAV' },
    { value: 'change', label: 'Change' }
  ];
  const onCategoryChange = jest.fn();
  const onSortChange = jest.fn();
  const onRefresh = jest.fn();

  it('renders with categories and selected value', () => {
    render(
      <DashboardControls
        categoryOptions={categoryOptions}
        selectedCategory="large-cap"
        onCategoryChange={onCategoryChange}
        sortOptions={sortOptions}
        selectedSort="nav"
        onSortChange={onSortChange}
        onRefresh={onRefresh}
      />
    );
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Sort By')).toBeInTheDocument();
  });

  it('calls onCategoryChange when dropdown changes', () => {
    render(
      <DashboardControls
        categoryOptions={categoryOptions}
        selectedCategory="large-cap"
        onCategoryChange={onCategoryChange}
        sortOptions={sortOptions}
        selectedSort="nav"
        onSortChange={onSortChange}
        onRefresh={onRefresh}
      />
    );
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'nifty50' } });
    expect(onCategoryChange).toHaveBeenCalledWith('nifty50');
  });

  it('calls onSortChange when sort dropdown changes', () => {
    render(
      <DashboardControls
        categoryOptions={categoryOptions}
        selectedCategory="large-cap"
        onCategoryChange={onCategoryChange}
        sortOptions={sortOptions}
        selectedSort="nav"
        onSortChange={onSortChange}
        onRefresh={onRefresh}
      />
    );
    fireEvent.change(screen.getByLabelText(/sort/i), { target: { value: 'nav' } });
    expect(onSortChange).toHaveBeenCalledWith('nav');
  });

  it('calls onRefresh when refresh button is clicked', () => {
    render(
      <DashboardControls
        categoryOptions={categoryOptions}
        selectedCategory="large-cap"
        onCategoryChange={onCategoryChange}
        sortOptions={sortOptions}
        selectedSort="nav"
        onSortChange={onSortChange}
        onRefresh={onRefresh}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /refresh/i }));
    expect(onRefresh).toHaveBeenCalled();
  });
}); 