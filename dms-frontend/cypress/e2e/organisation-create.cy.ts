describe('Organisation Create', () => {
  const createOrganisationBtn = '[data-cy="create-organisation"]'
  const formField = '[data-cy="form-field"]'

  it('should initialise an empty form', () => {
    cy.visit('/organisations/create')
    cy.get(formField).eq(0).find('.q-field input').should('have.value', '') // name
    cy.get(formField).eq(1).find('.q-field input').should('have.value', '') // title
    cy.get(formField).eq(2).find('.q-field input').should('have.value', '') // address
    cy.get(formField).eq(3).find('.q-field input').should('have.value', '') // locality
    cy.get(formField).eq(4).find('.q-field input').should('have.value', '') // postCode
    // logoUrl field is commented out in form
    cy.get(formField).eq(6).find('.q-field input').should('have.value', '') // object
    cy.get(formField).eq(7).find('.q-field textarea').should('have.value', '') // objectDescription
    cy.get(formField).eq(8).find('.q-field input').should('have.value', '') // signatoryName
    cy.get(formField).eq(9).find('.q-field input').should('have.value', '') // signatoryPosition
    // signatureUrl field is commented out in form
  })
  it('should show validation errors', () => {
    cy.visit('/organisations/create')

    cy.get(createOrganisationBtn).click()

    cy.get('.q-field--error .q-field__bottom .q-field__messages').should('have.length', 1)
    cy.get('.q-field--error .q-field__bottom .q-field__messages')
      .eq(0)
      .should('have.text', 'Obligatoire')
  })
  it.only('should allow filling in various fields', () => {
    cy.visit('/organisations/create')

    // Enter name (required)
    cy.get(formField).eq(0).find('input').type('New Organisation')

    // Enter title
    cy.get(formField).eq(1).find('input').type('Organisation Title')

    // Enter address
    cy.get(formField).eq(2).find('input').type('123 Main Street')

    // Enter locality
    cy.get(formField).eq(3).find('input').type('Paris')

    // Enter post code
    cy.get(formField).eq(4).find('input').type('75001')

    // logoUrl field is commented out - skip it

    // Enter object
    cy.get(formField).eq(6).find('input').type('Charitable Organization')

    // Enter object description
    cy.get(formField)
      .eq(7)
      .find('textarea')
      .type('A charitable organization focused on helping the community.')

    // Enter signatory name
    cy.get(formField).eq(8).find('input').type('John Doe')

    // Enter signatory position
    cy.get(formField).eq(9).find('input').type('President')

    // signatureUrl field is commented out - skip it

    cy.mockOrganisationList()
    cy.mockCreateOrganisation({
      name: 'New Organisation',
      title: 'Organisation Title',
      address: '123 Main Street',
      locality: 'Paris',
      postCode: '75001',
      object: 'Charitable Organization',
      objectDescription: 'A charitable organization focused on helping the community.',
      signatoryName: 'John Doe',
      signatoryPosition: 'President',
    })
    cy.get(createOrganisationBtn).click()

    cy.location('pathname').should('eq', '/organisations')
    cy.get('.q-notification').should('contain.text', "L'organisation a été créée avec succès.")
  })
})
