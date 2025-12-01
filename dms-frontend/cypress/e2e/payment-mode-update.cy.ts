describe('Payment Mode Update', () => {
  beforeEach(() => {
    cy.mockPaymentMode(0)
  })

  const updatePaymentModeBtn = '[data-cy="update-payment-mode"]'
  const deletePaymentModeBtn = '[data-cy="delete-payment-mode"]'
  const formField = '[data-cy="form-field"]'

  it('should initialise an existing form', () => {
    cy.visit('/payment-modes/payment-mode-id-1')
    cy.wait(['@getPaymentMode'])
    cy.get(formField).eq(0).find('.q-field input').should('have.value', 'Payment Mode 1')
  })
  it('should show validation errors', () => {
    cy.visit('/payment-modes/payment-mode-id-1')
    cy.wait(['@getPaymentMode'])
    cy.get(formField).eq(0).find('input').clear()

    cy.get(updatePaymentModeBtn).click()

    cy.get('.q-field--error .q-field__bottom .q-field__messages')
      .should('have.length', 1)
      .should('have.text', 'Obligatoire')
  })
  it('should allow changing various fields', () => {
    cy.visit('/payment-modes/payment-mode-id-1')
    cy.wait(['@getPaymentMode'])
    // Change name
    cy.get(formField).eq(0).find('input').clear()
    cy.get(formField).eq(0).find('input').type('New Payment Mode')

    cy.mockPaymentModeList()
    cy.mockUpdatePaymentMode('payment-mode-id-1', {
      name: 'New Payment Mode',
    })
    cy.get(updatePaymentModeBtn).click()

    cy.location('pathname').should('eq', '/payment-modes')
    cy.get('.q-notification').should(
      'contain.text',
      'Le mode de paiement a été mis à jour avec succès.',
    )
  })
  it('should allow deleting the payment mode', () => {
    cy.visit('/payment-modes/payment-mode-id-1')
    cy.wait(['@getPaymentMode'])

    cy.get(deletePaymentModeBtn).click()

    cy.mockPaymentModeList()
    cy.mockDisablePaymentMode('payment-mode-id-1')
    cy.get('.q-dialog .q-btn').eq(1).click() // confirm delete

    cy.location('pathname').should('eq', '/payment-modes')
    cy.get('.q-notification').should(
      'contain.text',
      'Le mode de paiement a été supprimé avec succès.',
    )
  })
})
