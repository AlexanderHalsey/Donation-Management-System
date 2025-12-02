describe('Organisation Update', () => {
  beforeEach(() => {
    cy.mockOrganisation(0)
  })

  const updateOrganisationBtn = '[data-cy="update-organisation"]'
  const deleteOrganisationBtn = '[data-cy="delete-organisation"]'
  const formField = '[data-cy="form-field"]'

  it('should initialise an existing form', () => {
    cy.visit('/organisations/organisation-id-1')
    cy.wait(['@getOrganisation'])
    cy.get(formField).eq(0).find('.q-field input').should('have.value', 'Organisation 1')
    cy.get(formField).eq(1).find('.q-field input').should('have.value', 'Title 1')
    cy.get(formField).eq(2).find('.q-field input').should('have.value', 'Address 1')
    cy.get(formField).eq(3).find('.q-field input').should('have.value', 'Locality 1')
    cy.get(formField).eq(4).find('.q-field input').should('have.value', 'PostCode 1')
    // logoUrl field is commented out
    cy.get(formField).eq(6).find('.q-field input').should('have.value', 'Object 1')
    cy.get(formField).eq(7).find('.q-field textarea').should('have.value', 'Object Description 1')
    cy.get(formField).eq(8).find('.q-field input').should('have.value', 'Signatory Name 1')
    cy.get(formField).eq(9).find('.q-field input').should('have.value', 'Signatory Position 1')
    // signatureUrl field is commented out
  })
  it('should show validation errors', () => {
    cy.visit('/organisations/organisation-id-1')
    cy.wait(['@getOrganisation'])
    cy.get(formField).eq(0).find('input').clear()

    cy.get(updateOrganisationBtn).click()

    cy.get('.q-field--error .q-field__bottom .q-field__messages')
      .should('have.length', 1)
      .should('have.text', 'Obligatoire')
  })
  it('should allow changing various fields', () => {
    cy.visit('/organisations/organisation-id-1')
    cy.wait(['@getOrganisation'])

    // Change name
    cy.get(formField).eq(0).find('input').clear()
    cy.get(formField).eq(0).find('input').type('Updated Organisation')

    // Change title
    cy.get(formField).eq(1).find('input').clear()
    cy.get(formField).eq(1).find('input').type('Updated Title')

    // Change address
    cy.get(formField).eq(2).find('input').clear()
    cy.get(formField).eq(2).find('input').type('456 Updated Street')

    // Change locality
    cy.get(formField).eq(3).find('input').clear()
    cy.get(formField).eq(3).find('input').type('Updated City')

    // Change post code
    cy.get(formField).eq(4).find('input').clear()
    cy.get(formField).eq(4).find('input').type('75002')

    // logoUrl field is commented out - skip it

    // Change object
    cy.get(formField).eq(6).find('input').clear()
    cy.get(formField).eq(6).find('input').type('Updated Object')

    // Change object description
    cy.get(formField).eq(7).find('textarea').clear()
    cy.get(formField).eq(7).find('textarea').type('Updated description for this organisation.')

    // Change signatory name
    cy.get(formField).eq(8).find('input').clear()
    cy.get(formField).eq(8).find('input').type('Jane Smith')

    // Change signatory position
    cy.get(formField).eq(9).find('input').clear()
    cy.get(formField).eq(9).find('input').type('Director')

    // signatureUrl field is commented out - skip it

    cy.mockOrganisationList()
    cy.mockUpdateOrganisation('organisation-id-1', {
      name: 'Updated Organisation',
      title: 'Updated Title',
      address: '456 Updated Street',
      locality: 'Updated City',
      postCode: '75002',
      object: 'Updated Object',
      objectDescription: 'Updated description for this organisation.',
      signatoryName: 'Jane Smith',
      signatoryPosition: 'Director',
    })
    cy.get(updateOrganisationBtn).click()

    cy.location('pathname').should('eq', '/organisations')
    cy.get('.q-notification').should(
      'contain.text',
      "L'organisation a été mise à jour avec succès.",
    )
  })
  it('should allow deleting the organisation', () => {
    cy.visit('/organisations/organisation-id-1')
    cy.wait(['@getOrganisation'])

    cy.get(deleteOrganisationBtn).click()

    cy.mockOrganisationList()
    cy.mockDisableOrganisation('organisation-id-1')
    cy.get('.q-dialog .q-btn').eq(1).click() // confirm delete

    cy.location('pathname').should('eq', '/organisations')
    cy.get('.q-notification').should('contain.text', "L'organisation a été supprimée avec succès.")
  })
})
