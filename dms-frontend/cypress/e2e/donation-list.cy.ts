describe('Donation List', () => {
  beforeEach(() => {
    cy.mockDonationList()
  })

  const donationListTable = '.donation-list-table'
  const donationListHeader = donationListTable + ' thead tr:first-child'
  const donationListItem = donationListTable + ' tbody tr'
  const donationListFooter = donationListTable + ' .q-table__bottom'
  const pageSizeSelect = donationListFooter + ' .q-table__control:nth-child(2) label'
  const paginationInfo = donationListFooter + ' .q-table__control:nth-child(3) span'
  const paginationControls = donationListFooter + ' .q-table__control:nth-child(3) button'

  it('displays the donation list', () => {
    cy.visit('/donations')
    cy.wait('@getDonationList')
    cy.get(donationListItem).should('have.length', 10)
    cy.get(donationListItem)
      .first()
      .within(() => {
        // TODO - add test for contact column
        cy.get('td').eq(1).should('contain.text', '09/04/2024')
        cy.get('td').eq(2).should('contain.text', '100.00 €')
        cy.get('td').eq(3).should('contain.text', 'Payment Mode 4')
        cy.get('td').eq(4).should('contain.text', 'Organisation 2')
        cy.get('td').eq(5).should('contain.text', 'Donation Type 10')
      })
    cy.get(donationListItem)
      .eq(3)
      .within(() => {
        // TODO - add test for contact column
        cy.get('td').eq(1).should('contain.text', '06/04/2024')
        cy.get('td').eq(2).should('contain.text', '70.00 €')
        cy.get('td').eq(3).should('contain.text', 'Payment Mode 1')
        cy.get('td').eq(4).should('contain.text', 'Organisation 1')
        cy.get('td').eq(5).should('contain.text', 'Donation Type 7')
      })
    cy.get(donationListItem)
      .eq(7)
      .within(() => {
        // TODO - add test for contact column
        cy.get('td').eq(1).should('contain.text', '02/04/2024')
        cy.get('td').eq(2).should('contain.text', '30.00 €')
        cy.get('td').eq(3).should('contain.text', 'Payment Mode 1')
        cy.get('td').eq(4).should('contain.text', 'Organisation 1')
        cy.get('td').eq(5).should('contain.text', 'Donation Type 3')
      })
  })
  it('allows the user to navigate pages', () => {
    cy.visit('/donations')
    cy.wait('@getDonationList')
    cy.get(paginationInfo).should('contain.text', '1-10 of 100')

    cy.mockDonationList({ page: 2, pageSize: 10, orderBy: { createdAt: 'desc' } })
    cy.get(paginationControls).eq(2).click() // Go to next page
    cy.wait('@getDonationList')
    cy.get(donationListItem).should('have.length', 10)
    cy.get(paginationInfo).should('contain.text', '11-20 of 100')

    cy.mockDonationList({ page: 10, pageSize: 10, orderBy: { createdAt: 'desc' } })
    cy.get(paginationControls).eq(3).click() // Go to end page
    cy.wait('@getDonationList')
    cy.get(donationListItem).should('have.length', 10)
    cy.get(paginationInfo).should('contain.text', '91-100 of 100')

    cy.mockDonationList({ page: 9, pageSize: 10, orderBy: { createdAt: 'desc' } })
    cy.get(paginationControls).eq(1).click() // Go to previous page
    cy.wait('@getDonationList')
    cy.get(donationListItem).should('have.length', 10)
    cy.get(paginationInfo).should('contain.text', '81-90 of 100')

    cy.mockDonationList({ page: 1, pageSize: 10, orderBy: { createdAt: 'desc' } })
    cy.get(paginationControls).eq(0).click() // Go to first page
    cy.wait('@getDonationList')
    cy.get(donationListItem).should('have.length', 10)
    cy.get(paginationInfo).should('contain.text', '1-10 of 100')
  })
  it('allows the user to change page size', () => {
    cy.visit('/donations')
    cy.wait('@getDonationList')
    cy.get(paginationInfo).should('contain.text', '1-10 of 100')

    cy.mockDonationList({ page: 2, pageSize: 10, orderBy: { createdAt: 'desc' } })
    cy.get(paginationControls).eq(2).click() // Go to next page
    cy.wait('@getDonationList')
    cy.get(donationListItem).should('have.length', 10)
    cy.get(paginationInfo).should('contain.text', '11-20 of 100')

    cy.get(pageSizeSelect).should('contain.text', '10').click()
    cy.mockDonationList({ page: 1, pageSize: 50, orderBy: { createdAt: 'desc' } })
    cy.get('#q-portal--menu--1 .q-item').eq(3).click() // Select 50 rows per page
    cy.wait('@getDonationList')
    cy.get(donationListItem).should('have.length', 50)
    cy.get(paginationInfo).should('contain.text', '1-50 of 100')
  })
  it('allows the user to sort certain columns', () => {
    cy.visit('/donations')
    cy.wait('@getDonationList')
    cy.get(donationListHeader).within(() => {
      cy.mockDonationList({ page: 1, pageSize: 10, orderBy: { amount: 'asc' } })
      cy.get('th').eq(2).click() // Sort by Amount ascending
      cy.wait('@getDonationList')
    })
    cy.get(donationListItem)
      .first()
      .within(() => {
        cy.get('td').eq(2).should('contain.text', '10.00 €')
      })
    cy.get(donationListHeader).within(() => {
      cy.mockDonationList({ page: 1, pageSize: 10, orderBy: { amount: 'desc' } })
      cy.get('th').eq(2).click() // Sort by Amount descending
      cy.wait('@getDonationList')
    })
    cy.get(donationListItem)
      .first()
      .within(() => {
        cy.get('td').eq(2).should('contain.text', '100.00 €')
      })
    cy.get(donationListHeader).within(() => {
      cy.mockDonationList({ page: 1, pageSize: 10, orderBy: { organisation: { name: 'asc' } } })
      cy.get('th').eq(4).click() // Sort by Organisation ascending
      cy.wait('@getDonationList')
    })
    cy.get(donationListItem)
      .first()
      .within(() => {
        cy.get('td').eq(4).should('contain.text', 'Organisation 1')
      })
    cy.get(donationListHeader).within(() => {
      cy.mockDonationList({ page: 1, pageSize: 10, orderBy: { organisation: { name: 'desc' } } })
      cy.get('th').eq(4).click() // Sort by Organisation descending
      cy.wait('@getDonationList')
    })
    cy.get(donationListItem)
      .first()
      .within(() => {
        cy.get('td').eq(4).should('contain.text', 'Organisation 2')
      })
  })
  it('should allow a user to navigate to the user update page', () => {
    cy.visit('/donations')
    cy.wait('@getDonationList')
    cy.get(donationListItem)
      .eq(3)
      .within(() => {
        cy.get('td').eq(6).find('button').click() // Click action button
      })
    cy.get('#q-portal--menu--1 .q-item').eq(0).click() // Click edit action
    cy.url().should('match', /\/donations\/[a-f0-9\-]{36}$/)
  })
  // TODO - add test for delete action
})
