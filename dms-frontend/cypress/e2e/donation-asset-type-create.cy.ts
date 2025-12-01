describe('Donation Asset Type Create', () => {
  const createDonationAssetTypeBtn = '[data-cy="create-donation-asset-type"]'
  const formField = '[data-cy="form-field"]'

  it('should initialise an empty form', () => {
    cy.visit('/donation-asset-types/create')
    cy.get(formField).should('have.length', 2).eq(0).should('have.value', '')
    cy.get(formField).eq(1).find('input[type="checkbox"]').should('not.be.checked')
  })

  it('should show validation errors', () => {
    cy.visit('/donation-asset-types/create')
    cy.get(createDonationAssetTypeBtn).click()

    cy.get('.q-field--error .q-field__bottom .q-field__messages')
      .should('have.length', 1)
      .should('have.text', 'Obligatoire')
  })

  it('should submit the form successfully', () => {
    cy.visit('/donation-asset-types/create')

    cy.get(formField).eq(0).find('.q-field').type('New Donation Asset Type')

    cy.mockCreateDonationAssetType({
      name: 'New Donation Asset Type',
      isDefault: false,
    })
    cy.mockDonationAssetTypeList()
    cy.get(createDonationAssetTypeBtn).click()

    cy.location('pathname').should('eq', '/donation-asset-types')
    cy.get('.q-notification .q-notification__message').should(
      'have.text',
      'La nature du don a été créée avec succès.',
    )
  })
})
