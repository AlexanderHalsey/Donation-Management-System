describe('Donation Asset Type Update', () => {
  beforeEach(() => {
    cy.mockDonationAssetType(0)
  })

  const updateDonationAssetTypeBtn = '[data-cy="update-donation-asset-type"]'
  const deleteDonationAssetTypeBtn = '[data-cy="delete-donation-asset-type"]'
  const formField = '[data-cy="form-field"]'

  it('should initialise an existing form', () => {
    cy.visit('/donation-asset-types/donation-asset-type-id-1')
    cy.wait(['@getDonationAssetType'])
    cy.get(formField).eq(0).find('.q-field input').should('have.value', 'Donation Asset Type 1')
    cy.get(formField).eq(1).find('.q-checkbox__inner--truthy').should('exist')
  })
  it('should show validation errors', () => {
    cy.visit('/donation-asset-types/donation-asset-type-id-1')
    cy.wait(['@getDonationAssetType'])
    cy.get(formField).eq(0).find('input').clear()

    cy.get(updateDonationAssetTypeBtn).click()

    cy.get('.q-field--error .q-field__bottom .q-field__messages')
      .should('have.length', 1)
      .should('have.text', 'Obligatoire')
  })
  it('should allow changing various fields', () => {
    cy.visit('/donation-asset-types/donation-asset-type-id-1')
    cy.wait(['@getDonationAssetType'])
    // Change name
    cy.get(formField).eq(0).find('input').clear()
    cy.get(formField).eq(0).find('input').type('New Donation Asset Type')

    // Change isDisabled
    cy.get(formField).eq(1).find('.q-checkbox').click()
    cy.mockDonationAssetTypeList()
    cy.mockUpdateDonationAssetType('donation-asset-type-id-1', {
      name: 'New Donation Asset Type',
      isDefault: false,
    })
    cy.get(updateDonationAssetTypeBtn).click()

    cy.location('pathname').should('eq', '/donation-asset-types')
    cy.get('.q-notification').should(
      'contain.text',
      'La nature du don a été mise à jour avec succès.',
    )
  })
  it('should allow deleting the donation asset type', () => {
    cy.visit('/donation-asset-types/donation-asset-type-id-1')
    cy.wait(['@getDonationAssetType'])

    cy.get(deleteDonationAssetTypeBtn).click()

    cy.mockDonationAssetTypeList()
    cy.mockDisableDonationAssetType('donation-asset-type-id-1')
    cy.get('.q-dialog .q-btn').eq(1).click() // confirm delete

    cy.location('pathname').should('eq', '/donation-asset-types')
    cy.get('.q-notification').should(
      'contain.text',
      'La nature du don a été supprimée avec succès.',
    )
  })
})
