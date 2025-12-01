describe('Donation Method Create', () => {
  beforeEach(() => {
    cy.mockDonationMethodList()
  })

  const createDonationMethodBtn = '[data-cy="create-donation-method"]'
  const formField = '[data-cy="form-field"]'

  it('should initialise an empty form', () => {
    cy.visit('/donation-methods/create')
    cy.get(formField).eq(0).find('.q-field input').should('have.value', '')
    cy.get(formField).eq(1).find('.q-checkbox__inner--truthy').should('not.exist')
  })
  it('should show validation errors', () => {
    cy.visit('/donation-methods/create')

    cy.get(createDonationMethodBtn).click()

    cy.get('.q-field--error .q-field__bottom .q-field__messages')
      .should('have.length', 1)
      .should('have.text', 'Obligatoire')
  })
  it('should allow filling in various fields', () => {
    cy.visit('/donation-methods/create')

    // Enter name
    cy.get(formField).eq(0).find('input').type('New Donation Method')

    // Check isDefault
    cy.get(formField).eq(1).find('.q-checkbox').click()

    cy.mockCreateDonationMethod({
      name: 'New Donation Method',
      isDefault: true,
    })
    cy.get(createDonationMethodBtn).click()

    cy.location('pathname').should('eq', '/donation-methods')
    cy.get('.q-notification').should('contain.text', 'La forme de don a été créée avec succès.')
  })
})
