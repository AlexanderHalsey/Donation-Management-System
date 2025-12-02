describe('Organisation List', () => {
  beforeEach(() => {
    cy.mockOrganisationList()
  })

  const organisationTable = '[data-cy="organisation-list-table"]'
  const organisationHeader = organisationTable + ' thead tr:first-child'
  const organisationListItem = organisationTable + ' tbody tr'

  it('displays the organisation list', () => {
    cy.visit('/organisations')
    cy.wait(['@getOrganisationList'])
    cy.get(organisationListItem).should('have.length', 2)
    cy.get(organisationListItem)
      .first()
      .within(() => {
        cy.get('td').eq(0).should('contain.text', 'Organisation 1')
        cy.get('td').eq(1).should('contain.text', 'Title 1')
        cy.get('td').eq(2).should('contain.text', 'Locality 1')
      })
    cy.get(organisationListItem)
      .eq(1)
      .within(() => {
        cy.get('td').eq(0).should('contain.text', 'Organisation 2')
        cy.get('td').eq(1).should('contain.text', 'Title 2')
        cy.get('td').eq(2).should('contain.text', 'Locality 2')
      })
  })
  it('allows the user to sort by name column', () => {
    cy.visit('/organisations')
    cy.wait(['@getOrganisationList'])
    cy.get(organisationHeader).within(() => {
      cy.get('th').eq(0).click() // Sort by name descending
    })
    cy.get(organisationListItem)
      .first()
      .within(() => {
        cy.get('td').eq(0).should('contain.text', 'Organisation 2')
      })
    cy.get(organisationHeader).within(() => {
      cy.get('th').eq(0).click() // Sort by name ascending
    })
    cy.get(organisationListItem)
      .first()
      .within(() => {
        cy.get('td').eq(0).should('contain.text', 'Organisation 1')
      })
  })
})
