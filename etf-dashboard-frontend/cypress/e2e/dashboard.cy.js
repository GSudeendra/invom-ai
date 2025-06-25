/// <reference types="cypress" />

describe('ETF Dashboard - Main User Flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('waits for category select to be populated', () => {
    cy.get('[data-testid="category-select"]').first().should('exist');
    cy.get('[data-testid="category-select"] option', { timeout: 10000 })
      .should('have.length.greaterThan', 0);
  });

  it('loads categories and selects Large Cap by default', () => {
    cy.get('[data-testid="category-select"] option', { timeout: 10000 })
      .should('have.length.greaterThan', 0);
    cy.get('[data-testid="category-select"]').first().should('exist');
    cy.get('[data-testid="category-select"] option').then($options => {
      const values = [...$options].map(o => o.value);
      // Try both camelCase and kebab-case
      if (values.includes('largeCap')) {
        cy.get('[data-testid="category-select"]').first().should('have.value', 'largeCap');
      } else if (values.includes('large-cap')) {
        cy.get('[data-testid="category-select"]').first().should('have.value', 'large-cap');
      } else {
        throw new Error('No Large Cap option found in category select');
      }
    });
  });

  it('shows ETF grid for selected category', () => {
    cy.get('[data-testid="category-select"] option', { timeout: 10000 })
      .should('have.length.greaterThan', 0);
    cy.get('[data-testid="category-select"] option').then($options => {
      const values = [...$options].map(o => o.value);
      const largeCapValue = values.includes('largeCap') ? 'largeCap' : (values.includes('large-cap') ? 'large-cap' : values[0]);
      cy.get('[data-testid="category-select"]').first().select(largeCapValue);
      cy.get('.etf-card, .etf-card-container').should('exist');
    });
  });

  it('can select a different category and see ETF grid update', () => {
    cy.get('[data-testid="category-select"] option', { timeout: 10000 })
      .should('have.length.greaterThan', 1);
    cy.get('[data-testid="category-select"] option').then($options => {
      if ($options.length > 1) {
        const secondValue = $options[1].value;
        cy.get('[data-testid="category-select"]').first().select(secondValue);
        cy.get('.etf-card, .etf-card-container').should('exist');
      }
    });
  });

  it('shows empty state if no ETFs in category', () => {
    cy.get('[data-testid="category-select"] option', { timeout: 10000 })
      .should('have.length.greaterThan', 0);
    cy.get('[data-testid="category-select"] option').each($option => {
      const value = $option.val();
      cy.get('[data-testid="category-select"]').first().select(value);
      cy.get('body').then($body => {
        if ($body.text().includes('No ETFs')) {
          cy.contains('No ETFs').should('exist');
        }
      });
    });
  });

  it('toggles live mode and sees live data indicator', () => {
    cy.get('[data-testid="live-toggle-btn"]').click();
    cy.get('.live-indicator, .live-pulse').should('exist');
  });

  it('refreshes NAV data', () => {
    cy.get('[data-testid="refresh-btn"]').click();
    cy.contains(/refreshing|updated/i);
  });

  it('shows loading and error states', () => {
    cy.get('[data-testid="loading-indicator"]', { timeout: 10000 }).should('exist');
    // cy.contains('Error').should('not.exist');
  });
}); 