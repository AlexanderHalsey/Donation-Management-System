describe('Donation Type Create', () => {
  beforeEach(() => {
    cy.mockDonationTypeList()
    cy.mockOrganisationRefList()
  })

  const createDonationTypeBtn = '[data-cy="create-donation-type"]'
  const formField = '[data-cy="form-field"]'

  it('should initialise an empty form', () => {
    cy.visit('/donation-types/create')
    cy.get(formField).eq(0).find('.q-field input').should('have.value', '')
    cy.get(formField).eq(1).find('.q-select input').should('have.value', '')
  })
  it('should show validation errors', () => {
    cy.visit('/donation-types/create')

    cy.get(createDonationTypeBtn).click()

    cy.get('.q-field--error .q-field__bottom .q-field__messages').should('have.length', 2)
    cy.get('.q-field--error .q-field__bottom .q-field__messages')
      .eq(0)
      .should('have.text', 'Obligatoire')
    cy.get('.q-field--error .q-field__bottom .q-field__messages')
      .eq(1)
      .should('contain.text', 'Obligatoire')
  })
  it('should allow filling in various fields', () => {
    cy.visit('/donation-types/create')
    cy.wait(['@getOrganisationRefList'])

    // Enter name
    cy.get(formField).eq(0).find('input').type('New Donation Type')

    // Select organisation
    cy.get(formField).eq(1).find('.q-select').click()
    cy.get('.q-menu .q-item').first().click()

    cy.mockCreateDonationType({
      name: 'New Donation Type',
      organisationId: 'organisation-id-1',
    })
    cy.get(createDonationTypeBtn).click()

    cy.location('pathname').should('eq', '/donation-types')
    cy.get('.q-notification').should('contain.text', 'Le type de don a été créé avec succès.')
  })
})
