describe('Donation Method Update', () => {
  beforeEach(() => {
    cy.mockDonationMethod(0)
  })

  const updateDonationMethodBtn = '[data-cy="update-donation-method"]'
  const deleteDonationMethodBtn = '[data-cy="delete-donation-method"]'
  const formField = '[data-cy="form-field"]'

  it('should initialise an existing form', () => {
    cy.visit('/donation-methods/donation-method-id-1')
    cy.wait(['@getDonationMethod'])
    cy.get(formField).eq(0).find('.q-field input').should('have.value', 'Donation Method 1')
    cy.get(formField).eq(1).find('.q-checkbox__inner--truthy').should('exist')
  })
  it('should show validation errors', () => {
    cy.visit('/donation-methods/donation-method-id-1')
    cy.wait(['@getDonationMethod'])
    cy.get(formField).eq(0).find('input').clear()

    cy.get(updateDonationMethodBtn).click()

    cy.get('.q-field--error .q-field__bottom .q-field__messages')
      .should('have.length', 1)
      .should('have.text', 'Obligatoire')
  })
  it('should allow changing various fields', () => {
    cy.visit('/donation-methods/donation-method-id-1')
    cy.wait(['@getDonationMethod'])
    // Change name
    cy.get(formField).eq(0).find('input').clear()
    cy.get(formField).eq(0).find('input').type('New Donation Method')

    // Change isDisabled
    cy.get(formField).eq(1).find('.q-checkbox').click()
    cy.mockDonationMethodList()
    cy.mockUpdateDonationMethod('donation-method-id-1', {
      name: 'New Donation Method',
      isDefault: false,
    })
    cy.get(updateDonationMethodBtn).click()

    cy.location('pathname').should('eq', '/donation-methods')
    cy.get('.q-notification').should(
      'contain.text',
      'La forme de don a été mise à jour avec succès.',
    )
  })
  it('should allow deleting the donation method', () => {
    cy.visit('/donation-methods/donation-method-id-1')
    cy.wait(['@getDonationMethod'])

    cy.get(deleteDonationMethodBtn).click()

    cy.mockDonationMethodList()
    cy.mockDisableDonationMethod('donation-method-id-1')
    cy.get('.q-dialog .q-btn').eq(1).click() // confirm delete

    cy.location('pathname').should('eq', '/donation-methods')
    cy.get('.q-notification').should('contain.text', 'La forme de don a été supprimée avec succès.')
  })
})
