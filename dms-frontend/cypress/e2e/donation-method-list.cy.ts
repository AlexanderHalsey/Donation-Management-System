describe('Donation Method List', () => {
  beforeEach(() => {
    cy.mockDonationMethodList()
  })

  const donationMethodTable = '[data-cy="donation-method-list-table"]'
  const donationMethodHeader = donationMethodTable + ' thead tr:first-child'
  const donationMethodListItem = donationMethodTable + ' tbody tr'

  it('displays the donation method list', () => {
    cy.visit('/donation-methods')
    cy.wait(['@getDonationMethodList'])
    cy.get(donationMethodListItem).should('have.length', 5)
    cy.get(donationMethodListItem)
      .first()
      .within(() => {
        cy.get('td').eq(0).should('contain.text', 'Donation Method 1')
        cy.get('td').eq(1).find('.q-icon').should('have.class', 'text-green')
      })
    cy.get(donationMethodListItem)
      .eq(1)
      .within(() => {
        cy.get('td').eq(0).should('contain.text', 'Donation Method 2')
        cy.get('td').eq(1).find('.q-icon').should('have.class', 'text-red')
      })
    cy.get(donationMethodListItem)
      .eq(4)
      .within(() => {
        cy.get('td').eq(0).should('contain.text', 'Donation Method 5')
        cy.get('td').eq(1).find('.q-icon').should('have.class', 'text-red')
      })
  })
  it('allows the user to sort certain columns', () => {
    cy.visit('/donation-methods')
    cy.wait(['@getDonationMethodList'])
    cy.get(donationMethodHeader).within(() => {
      cy.get('th').eq(1).click() // Sort by isDefault ascending
    })
    cy.get(donationMethodListItem)
      .first()
      .within(() => {
        cy.get('td').eq(1).find('.q-icon').should('have.class', 'text-red')
      })
    cy.get(donationMethodHeader).within(() => {
      cy.get('th').eq(1).click() // Sort by isDefault descending
    })
    cy.get(donationMethodListItem)
      .first()
      .within(() => {
        cy.get('td').eq(1).find('.q-icon').should('have.class', 'text-green')
      })
    cy.get(donationMethodHeader).within(() => {
      cy.get('th').eq(0).click() // Sort by name ascending
    })
    cy.get(donationMethodListItem)
      .first()
      .within(() => {
        cy.get('td').eq(0).should('contain.text', 'Donation Method 1')
      })
    cy.get(donationMethodHeader).within(() => {
      cy.get('th').eq(0).click() // Sort by name descending
    })
    cy.get(donationMethodListItem)
      .first()
      .within(() => {
        cy.get('td').eq(0).should('contain.text', 'Donation Method 5')
      })
  })
})
