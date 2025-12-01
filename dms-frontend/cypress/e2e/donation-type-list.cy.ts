describe('Donation Type List', () => {
  beforeEach(() => {
    cy.mockDonationTypeList()
    cy.mockOrganisationRefList()
  })

  const donationTypeTable = '[data-cy="donation-type-list-table"]'
  const donationTypeHeader = donationTypeTable + ' thead tr:first-child'
  const donationTypeListItem = donationTypeTable + ' tbody tr'

  it('displays the donation type list', () => {
    cy.visit('/donation-types')
    cy.wait(['@getDonationTypeList', '@getOrganisationRefList'])
    cy.get(donationTypeListItem).should('have.length', 10)
    cy.get(donationTypeListItem)
      .first()
      .within(() => {
        cy.get('td').eq(0).should('contain.text', 'Donation Type 1')
        cy.get('td').eq(1).should('contain.text', 'Organisation 1')
      })
    cy.get(donationTypeListItem)
      .eq(1)
      .within(() => {
        cy.get('td').eq(0).should('contain.text', 'Donation Type 10')
        cy.get('td').eq(1).should('contain.text', 'Organisation 2')
      })
    cy.get(donationTypeListItem)
      .eq(9)
      .within(() => {
        cy.get('td').eq(0).should('contain.text', 'Donation Type 9')
        cy.get('td').eq(1).should('contain.text', 'Organisation 1')
      })
  })
  it('allows the user to sort by name column', () => {
    cy.visit('/donation-types')
    cy.wait(['@getDonationTypeList', '@getOrganisationRefList'])
    cy.get(donationTypeHeader).within(() => {
      cy.get('th').eq(0).click() // Sort by name descending
    })
    cy.get(donationTypeListItem)
      .first()
      .within(() => {
        cy.get('td').eq(0).should('contain.text', 'Donation Type 9')
      })
    cy.get(donationTypeHeader).within(() => {
      cy.get('th').eq(0).click() // Sort by name ascending
    })
    cy.get(donationTypeListItem)
      .first()
      .within(() => {
        cy.get('td').eq(0).should('contain.text', 'Donation Type 1')
      })
  })
})
