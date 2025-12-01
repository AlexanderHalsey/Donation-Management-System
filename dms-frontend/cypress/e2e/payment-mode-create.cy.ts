describe('Payment Mode Create', () => {
  beforeEach(() => {
    cy.mockPaymentModeList()
  })

  const createPaymentModeBtn = '[data-cy="create-payment-mode"]'
  const formField = '[data-cy="form-field"]'

  it('should initialise an empty form', () => {
    cy.visit('/payment-modes/create')
    cy.get(formField).eq(0).find('.q-field input').should('have.value', '')
  })
  it('should show validation errors', () => {
    cy.visit('/payment-modes/create')

    cy.get(createPaymentModeBtn).click()

    cy.get('.q-field--error .q-field__bottom .q-field__messages')
      .should('have.length', 1)
      .should('have.text', 'Obligatoire')
  })
  it('should allow filling in various fields', () => {
    cy.visit('/payment-modes/create')

    // Enter name
    cy.get(formField).eq(0).find('input').type('New Payment Mode')

    cy.mockCreatePaymentMode({
      name: 'New Payment Mode',
    })
    cy.get(createPaymentModeBtn).click()

    cy.location('pathname').should('eq', '/payment-modes')
    cy.get('.q-notification').should('contain.text', 'Le mode de paiement a été créé avec succès.')
  })
})
