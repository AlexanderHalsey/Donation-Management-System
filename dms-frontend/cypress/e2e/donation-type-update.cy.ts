describe('Donation Type Update', () => {
  beforeEach(() => {
    cy.mockDonationType(0)
    cy.mockOrganisationRefList()
  })

  const updateDonationTypeBtn = '[data-cy="update-donation-type"]'
  const deleteDonationTypeBtn = '[data-cy="delete-donation-type"]'
  const formField = '[data-cy="form-field"]'

  it('should initialise an existing form', () => {
    cy.visit('/donation-types/donation-type-id-1')
    cy.wait(['@getDonationType', '@getOrganisationRefList'])
    cy.get(formField).eq(0).find('.q-field input').should('have.value', 'Donation Type 1')
    cy.get(formField).eq(1).find('.q-select').should('contain.text', 'Organisation 1')
  })
  it('should show validation errors', () => {
    cy.visit('/donation-types/donation-type-id-1')
    cy.wait(['@getDonationType', '@getOrganisationRefList'])
    cy.get(formField).eq(0).find('input').clear()

    cy.get(updateDonationTypeBtn).click()

    cy.get('.q-field--error .q-field__bottom .q-field__messages')
      .should('have.length', 1)
      .should('have.text', 'Obligatoire')
  })
  it('should allow changing various fields', () => {
    cy.visit('/donation-types/donation-type-id-1')
    cy.wait(['@getDonationType', '@getOrganisationRefList'])
    // Change name
    cy.get(formField).eq(0).find('input').clear()
    cy.get(formField).eq(0).find('input').type('New Donation Type')

    // Change organisation
    cy.get(formField).eq(1).find('.q-select').click()
    cy.get('.q-menu .q-item').eq(1).click()

    cy.mockDonationTypeList()
    cy.mockUpdateDonationType('donation-type-id-1', {
      name: 'New Donation Type',
      organisationId: 'organisation-id-2',
    })
    cy.get(updateDonationTypeBtn).click()

    cy.location('pathname').should('eq', '/donation-types')
    cy.get('.q-notification').should('contain.text', 'Le type de don a été mis à jour avec succès.')
  })
  it('should allow deleting the donation type', () => {
    cy.visit('/donation-types/donation-type-id-1')
    cy.wait(['@getDonationType', '@getOrganisationRefList'])

    cy.get(deleteDonationTypeBtn).click()

    cy.mockDonationTypeList()
    cy.mockDisableDonationType('donation-type-id-1')
    cy.get('.q-dialog .q-btn').eq(1).click() // confirm delete

    cy.location('pathname').should('eq', '/donation-types')
    cy.get('.q-notification').should('contain.text', 'Le type de don a été supprimé avec succès.')
  })
})
