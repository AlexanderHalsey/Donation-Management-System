import { v4 } from 'uuid'

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
    cy.get(formField).eq(5).find('.q-field input').should('have.value', '') // logoId
    cy.get(formField).eq(6).find('.q-field input').should('have.value', '') // object
    cy.get(formField).eq(7).find('.q-field textarea').should('have.value', '') // objectDescription
    cy.get(formField).eq(8).find('.q-field input').should('have.value', '') // signatoryName
    cy.get(formField).eq(9).find('.q-field input').should('have.value', '') // signatoryPosition
    cy.get(formField).eq(10).find('.q-field input').should('have.value', '') // signatureId
  })
  it('should show validation errors', () => {
    cy.visit('/organisations/create')

    cy.get(createOrganisationBtn).click()

    cy.get('.q-field--error .q-field__bottom .q-field__messages').should('have.length', 1)
    cy.get('.q-field--error .q-field__bottom .q-field__messages')
      .eq(0)
      .should('have.text', 'Obligatoire')
  })
  it('should allow filling in various fields', () => {
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

    // Upload logo
    cy.mockUploadImage()
    cy.get(formField)
      .eq(5)
      .find('input[type="file"]')
      .selectFile('cypress/fixtures/img/logo.png', { force: true })

    // Enter object
    cy.get(formField).eq(6).find('input').type('Charitable Organisation')

    // Enter object description
    cy.get(formField)
      .eq(7)
      .find('textarea')
      .type('A charitable organisation focused on helping the community.')

    // Enter signatory name
    cy.get(formField).eq(8).find('input').type('John Doe')

    // Enter signatory position
    cy.get(formField).eq(9).find('input').type('President')

    // Upload signature
    cy.mockUploadImage()
    cy.get(formField)
      .eq(10)
      .find('input[type="file"]')
      .selectFile('cypress/fixtures/img/signature.webp', { force: true })

    cy.mockOrganisationList()
    cy.mockCreateOrganisation({
      name: 'New Organisation',
      title: 'Organisation Title',
      address: '123 Main Street',
      locality: 'Paris',
      postCode: '75001',
      logoId: v4(),
      object: 'Charitable Organisation',
      objectDescription: 'A charitable organisation focused on helping the community.',
      signatoryName: 'John Doe',
      signatoryPosition: 'President',
      signatureId: v4(),
    })
    cy.get(createOrganisationBtn).click()

    cy.location('pathname').should('eq', '/organisations')
    cy.get('.q-notification').should('contain.text', "L'organisation a été créée avec succès.")
  })
})
