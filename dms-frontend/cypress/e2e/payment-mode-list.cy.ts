describe('Payment Mode List', () => {
  beforeEach(() => {
    cy.mockPaymentModeList()
  })

  const paymentModeTable = '[data-cy="payment-mode-list-table"]'
  const paymentModeHeader = paymentModeTable + ' thead tr:first-child'
  const paymentModeListItem = paymentModeTable + ' tbody tr'

  it('displays the payment mode list', () => {
    cy.visit('/payment-modes')
    cy.wait(['@getPaymentModeList'])
    cy.get(paymentModeListItem).should('have.length', 4)
    cy.get(paymentModeListItem)
      .first()
      .within(() => {
        cy.get('td').eq(0).should('contain.text', 'Payment Mode 1')
      })
    cy.get(paymentModeListItem)
      .eq(1)
      .within(() => {
        cy.get('td').eq(0).should('contain.text', 'Payment Mode 2')
      })
    cy.get(paymentModeListItem)
      .eq(3)
      .within(() => {
        cy.get('td').eq(0).should('contain.text', 'Payment Mode 4')
      })
  })
  it('allows the user to sort by name column', () => {
    cy.visit('/payment-modes')
    cy.wait(['@getPaymentModeList'])
    cy.get(paymentModeHeader).within(() => {
      cy.get('th').eq(0).click() // Sort by name ascending
    })
    cy.get(paymentModeListItem)
      .first()
      .within(() => {
        cy.get('td').eq(0).should('contain.text', 'Payment Mode 4')
      })
    cy.get(paymentModeHeader).within(() => {
      cy.get('th').eq(0).click() // Sort by name descending
    })
    cy.get(paymentModeListItem)
      .first()
      .within(() => {
        cy.get('td').eq(0).should('contain.text', 'Payment Mode 1')
      })
  })
})
