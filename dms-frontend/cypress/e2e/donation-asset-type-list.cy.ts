describe('Donation Asset Type List', () => {
  beforeEach(() => {
    cy.mockDonationAssetTypeList()
  })

  const donationAssetTypeTable = '[data-cy=donation-asset-type-list-table]'
  const donationAssetTypeHeader = donationAssetTypeTable + ' thead tr:first-child'
  const donationAssetTypeListItem = donationAssetTypeTable + ' tbody tr'

  it('displays the donation asset type list', () => {
    cy.visit('/donation-asset-types')
    cy.wait(['@getDonationAssetTypeList'])
    cy.get(donationAssetTypeListItem).should('have.length', 4)
    cy.get(donationAssetTypeListItem)
      .first()
      .within(() => {
        cy.get('td').eq(0).should('contain.text', 'Donation Asset Type 1')
        cy.get('td').eq(1).find('.q-icon').should('have.class', 'text-green')
      })
    cy.get(donationAssetTypeListItem)
      .eq(1)
      .within(() => {
        cy.get('td').eq(0).should('contain.text', 'Donation Asset Type 2')
        cy.get('td').eq(1).find('.q-icon').should('have.class', 'text-red')
      })
    cy.get(donationAssetTypeListItem)
      .eq(3)
      .within(() => {
        cy.get('td').eq(0).should('contain.text', 'Donation Asset Type 4')
        cy.get('td').eq(1).find('.q-icon').should('have.class', 'text-red')
      })
  })
  it('allows the user to sort certain columns', () => {
    cy.visit('/donation-asset-types')
    cy.wait(['@getDonationAssetTypeList'])
    cy.get(donationAssetTypeHeader).within(() => {
      cy.get('th').eq(1).click() // Sort by isDefault ascending
    })
    cy.get(donationAssetTypeListItem)
      .first()
      .within(() => {
        cy.get('td').eq(1).find('.q-icon').should('have.class', 'text-red')
      })
    cy.get(donationAssetTypeHeader).within(() => {
      cy.get('th').eq(1).click() // Sort by isDefault descending
    })
    cy.get(donationAssetTypeListItem)
      .first()
      .within(() => {
        cy.get('td').eq(1).find('.q-icon').should('have.class', 'text-green')
      })
    cy.get(donationAssetTypeHeader).within(() => {
      cy.get('th').eq(0).click() // Sort by name ascending
    })
    cy.get(donationAssetTypeListItem)
      .first()
      .within(() => {
        cy.get('td').eq(0).should('contain.text', 'Donation Asset Type 1')
      })
    cy.get(donationAssetTypeHeader).within(() => {
      cy.get('th').eq(0).click() // Sort by name descending
    })
    cy.get(donationAssetTypeListItem)
      .first()
      .within(() => {
        cy.get('td').eq(0).should('contain.text', 'Donation Asset Type 4')
      })
  })
})
