describe('Dashboard', () => {
  beforeEach(() => {
    cy.mockRefreshToken({})
    cy.mockDashboardSummaries()
  })

  const DASHBOARD_TABS = '[data-cy="dashboard-tabs"] .q-tab'

  it('should display dashboard donation summaries', () => {
    cy.visitPage('/dashboard')
    cy.get('[data-cy="total-donations"]').within((card) => {
      cy.wrap(card).get('div').eq(1).should('contain.text', '50000 dons')
      cy.wrap(card).get('div').eq(2).should('contain.text', '1 000 000,00 €')
    })
    cy.get('[data-cy="total-year-donations"]').within((card) => {
      cy.wrap(card).get('div').eq(1).should('contain.text', '2000 dons')
      cy.wrap(card).get('div').eq(2).should('contain.text', '40 000,00 €')
    })
    cy.get('[data-cy="total-month-donations"]').within((card) => {
      cy.wrap(card).get('div').eq(1).should('contain.text', '500 dons')
      cy.wrap(card).get('div').eq(2).should('contain.text', '10 000,00 €')
    })
    cy.get('[data-cy="current-week-donations"]').within(() => {
      cy.get('.text-subtitle2').should('contain', '100 dons | 2 000,00 €')
      cy.get('tbody tr').eq(1).find('td').eq(2).should('contain.text', '20,00 €')
    })
  })
  it('should display dashboard donor summaries', () => {
    cy.visitPage('/dashboard')
    cy.get(DASHBOARD_TABS).eq(1).should('contain', 'Donateurs').click()
    cy.get('[data-cy="disabled-donors"]').within(() => {
      cy.get('.q-table__bottom').should('contain.text', 'Aucun élément trouvé')
    })
  })
  it('should display warning sign on donor tab when there are disabled donors with donations', () => {
    cy.mockDashboardSummaries(true)
    cy.visitPage('/dashboard')
    cy.get(DASHBOARD_TABS).eq(1).should('contain', '⚠️').click()
    cy.get('[data-cy="disabled-donors"]').within(() => {
      cy.get('.text-h6').should('contain.text', '⚠️')
      cy.get('.q-table__control').children().eq(0).should('contain.text', '1-1 sur 1')
    })
  })
  it('should display dashboard tax receipt summaries', () => {
    cy.visitPage('/dashboard')
    cy.get(DASHBOARD_TABS).eq(2).should('contain', 'Reçus fiscaux').click()
    cy.get('[data-cy="tax-receipts-status-count"]').within(() => {
      cy.get('[data-cy="tax-receipt-status-option"]')
        .eq(0)
        .should('contain.text', 'En attente de génération')
        .should('contain.text', '20')
      cy.get('[data-cy="tax-receipt-status-option"]')
        .eq(1)
        .should('contain.text', 'En cours de génération')
        .should('contain.text', '20')
      cy.get('[data-cy="tax-receipt-status-option"]')
        .eq(2)
        .should('contain.text', 'Généré')
        .should('contain.text', '20')
      cy.get('[data-cy="tax-receipt-status-option"]')
        .eq(3)
        .should('contain.text', 'Annulé')
        .should('contain.text', '20')
      cy.get('[data-cy="tax-receipt-status-option"]')
        .eq(4)
        .should('contain.text', 'Échoué')
        .should('contain.text', '20')
    })
  })
  it('should display warning sign on tax receipt tab when there are failed tax receipts', () => {
    cy.visitPage('/dashboard')
    cy.get(DASHBOARD_TABS).eq(2).should('contain', '⚠️').click()
    cy.get('[data-cy="tax-receipts-status-count"]').children().eq(0).should('contain.text', '⚠️')
  })
})
