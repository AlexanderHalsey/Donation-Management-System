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
    cy.get(formField).eq(2).find('.q-checkbox').should('not.be.visible')
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
      isTaxReceiptEnabled: false,
    })
    cy.get(createDonationTypeBtn).click()

    cy.location('pathname').should('eq', '/donation-types')
    cy.get('.q-notification').should('contain.text', 'Le type de don a été créé avec succès.')
  })
  it('should allow enabling tax receipts', () => {
    cy.visit('/donation-types/create')
    cy.wait(['@getOrganisationRefList'])

    // Enter name
    cy.get(formField).eq(0).find('input').type('Donation Type with Tax Receipt')

    // Select organisation that has tax receipts enabled
    cy.get(formField).eq(1).find('.q-select').click()
    cy.get('.q-menu .q-item').first().click()

    // Tax receipt should now be visible
    cy.get(formField).eq(2).find('.q-checkbox').should('be.visible').click()

    // Change organisation to one that does not have tax receipts enabled
    cy.get(formField).eq(1).find('.q-select').click()
    cy.get('.q-menu .q-item').last().click()

    // Tax receipt should now be hidden and unchecked
    cy.get(formField).eq(2).find('.q-checkbox').should('not.be.visible')

    // Change organisation back to one that has tax receipts enabled
    cy.get(formField).eq(1).find('.q-select').click()
    cy.get('.q-menu .q-item').first().click()

    // Tax receipt should now be visible but unchecked
    cy.get(formField)
      .eq(2)
      .find('.q-checkbox')
      .should('be.visible')
      .should('not.have.class', 'q-checkbox--truthy')
  })
})
