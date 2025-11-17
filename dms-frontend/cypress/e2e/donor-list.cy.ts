describe('Donor List', () => {
  beforeEach(() => {
    cy.mockDonorList()
  })

  const donorListTable = '[data-cy="donor-list-table"]'
  const donorListHeader = donorListTable + ' thead tr:first-child'
  const donorListItem = donorListTable + ' tbody tr'
  const donorListFooter = donorListTable + ' .q-table__bottom'
  const pageSizeSelect = donorListFooter + ' .q-table__control:nth-child(2) label'
  const paginationInfo = donorListFooter + ' .q-table__control:nth-child(3) span'
  const paginationControls = donorListFooter + ' .q-table__control:nth-child(3) button'
  const filter = '[data-cy="donor-list-filter"]'

  it('displays the donor list', () => {
    cy.visit('/donors')
    cy.wait(['@getDonorList'])
    cy.get(donorListItem).should('have.length', 10)
    cy.get(donorListItem)
      .first()
      .within(() => {
        cy.get('td').eq(0).should('contain.text', 'LASTNAME1 FirstName1')
        cy.get('td').eq(1).should('contain.text', 'donor1@example.com')
        cy.get('td').eq(2).should('contain.text', '1')
        cy.get('td').eq(3).should('contain.text', '50,00 €')
      })
    cy.get(donorListItem)
      .eq(3)
      .within(() => {
        cy.get('td').eq(0).should('contain.text', 'LASTNAME4 FirstName4')
        cy.get('td').eq(1).should('contain.text', 'donor4@example.com')
        cy.get('td').eq(2).should('contain.text', '4')
        cy.get('td').eq(3).should('contain.text', '200,00 €')
      })
    cy.get(donorListItem)
      .eq(7)
      .within(() => {
        cy.get('td').eq(0).should('contain.text', 'LASTNAME8 FirstName8')
        cy.get('td').eq(1).should('contain.text', 'donor8@example.com')
        cy.get('td').eq(2).should('contain.text', '8')
        cy.get('td').eq(3).should('contain.text', '400,00 €')
      })
  })
  it('allows the user to navigate pages', () => {
    cy.visit('/donors')
    cy.wait(['@getDonorList'])
    cy.get(paginationInfo).should('contain.text', '1-10 of 30')

    cy.mockDonorList({ page: 2, pageSize: 10, orderBy: { updatedAt: 'desc' } })
    cy.get(paginationControls).eq(2).click() // Go to next page
    cy.wait(['@getDonorList'])
    cy.get(donorListItem).should('have.length', 10)
    cy.get(paginationInfo).should('contain.text', '11-20 of 30')

    cy.mockDonorList({ page: 3, pageSize: 10, orderBy: { updatedAt: 'desc' } })
    cy.get(paginationControls).eq(3).click() // Go to end page
    cy.wait(['@getDonorList'])
    cy.get(donorListItem).should('have.length', 10)
    cy.get(paginationInfo).should('contain.text', '21-30 of 30')

    cy.mockDonorList({ page: 2, pageSize: 10, orderBy: { updatedAt: 'desc' } })
    cy.get(paginationControls).eq(1).click() // Go to previous page
    cy.wait(['@getDonorList'])
    cy.get(donorListItem).should('have.length', 10)
    cy.get(paginationInfo).should('contain.text', '11-20 of 30')

    cy.mockDonorList({ page: 1, pageSize: 10, orderBy: { updatedAt: 'desc' } })
    cy.get(paginationControls).eq(0).click() // Go to first page
    cy.wait(['@getDonorList'])
    cy.get(donorListItem).should('have.length', 10)
    cy.get(paginationInfo).should('contain.text', '1-10 of 30')
  })
  it('allows the user to change page size', () => {
    cy.visit('/donors')
    cy.wait(['@getDonorList'])
    cy.get(paginationInfo).should('contain.text', '1-10 of 30')

    cy.mockDonorList({ page: 2, pageSize: 10, orderBy: { updatedAt: 'desc' } })
    cy.get(paginationControls).eq(2).click() // Go to next page
    cy.wait(['@getDonorList'])
    cy.get(donorListItem).should('have.length', 10)
    cy.get(paginationInfo).should('contain.text', '11-20 of 30')

    cy.get(pageSizeSelect).should('contain.text', '10').click()
    cy.mockDonorList({ page: 1, pageSize: 50, orderBy: { updatedAt: 'desc' } })
    cy.get('#q-portal--menu--1 .q-item').eq(3).click() // Select all rows per page
    cy.wait(['@getDonorList'])
    cy.get(donorListItem).should('have.length', 30)
    cy.get(paginationInfo).should('contain.text', '1-30 of 30')
  })
  it('allows the user to sort certain columns', () => {
    cy.visit('/donors')
    cy.wait(['@getDonorList'])
    cy.get(donorListHeader).within(() => {
      cy.mockDonorList({ page: 1, pageSize: 10, orderBy: { donationTotalAmount: 'asc' } })
      cy.get('th').eq(3).click() // Sort by total amount ascending
      cy.wait(['@getDonorList'])
    })
    cy.get(donorListItem)
      .first()
      .within(() => {
        cy.get('td').eq(3).should('contain.text', '50,00 €')
      })
    cy.get(donorListHeader).within(() => {
      cy.mockDonorList({ page: 1, pageSize: 10, orderBy: { donationTotalAmount: 'desc' } })
      cy.get('th').eq(3).click() // Sort by total amount descending
      cy.wait(['@getDonorList'])
    })
    cy.get(donorListItem)
      .first()
      .within(() => {
        cy.get('td').eq(3).should('contain.text', '650,00 €')
      })
    cy.get(donorListHeader).within(() => {
      cy.mockDonorList({ page: 1, pageSize: 10, orderBy: { donationCount: 'asc' } })
      cy.get('th').eq(2).click() // Sort by Donation count ascending
      cy.wait(['@getDonorList'])
    })
    cy.get(donorListItem)
      .first()
      .within(() => {
        cy.get('td').eq(2).should('contain.text', '1')
      })
    cy.get(donorListHeader).within(() => {
      cy.mockDonorList({ page: 1, pageSize: 10, orderBy: { donationCount: 'desc' } })
      cy.get('th').eq(2).click() // Sort by Donation count descending
      cy.wait(['@getDonorList'])
    })
    cy.get(donorListItem)
      .first()
      .within(() => {
        cy.get('td').eq(2).should('contain.text', '13')
      })
  })
  it('should allow a user to navigate to the user update page', () => {
    cy.visit('/donors')
    cy.wait(['@getDonorList'])
    cy.mockDonor(3)
    cy.get(donorListItem)
      .eq(3)
      .within(() => {
        cy.get('td').eq(0).find('a').click() // Click action button
      })
    cy.url().should('match', /\/donors\/[a-f0-9-]{36}$/)
  })
  describe('Filters', () => {
    const getFilterMenu = () => cy.get('#q-portal--menu--1 .q-menu').children().eq(0).children()
    it('should allow filtering by donor name', () => {
      const getDonorFilter = () => getFilterMenu().eq(1)
      cy.visit('/donors')
      cy.wait(['@getDonorList'])
      cy.get(filter).click()
      cy.mockDonorList(
        { page: 1, pageSize: 10, orderBy: { updatedAt: 'desc' } },
        { id: { in: [0] } },
      )
      cy.mockDonorRefList()
      getDonorFilter().within(() => {
        cy.get('.q-select__dropdown-icon').click()
      })
      cy.wait(['@getDonorRefList'])
      // select donor 1 as filter
      cy.get('[id^=q-portal--menu--]').eq(1).find('.q-item').eq(0).click()
      getDonorFilter().within(() => {
        cy.get('.q-select__dropdown-icon').click() // close dropdown
      })
      cy.get(paginationInfo).should('contain.text', '1-1 of 1')
      cy.mockDonorList(
        { page: 1, pageSize: 10, orderBy: { updatedAt: 'desc' } },
        { id: { in: [0, 1] } },
      )
      getDonorFilter().within(() => {
        cy.get('.q-select__dropdown-icon').click()
      })
      // select donor 2 as filter too
      cy.get('[id^=q-portal--menu--]').eq(1).find('.q-item').eq(1).click()
      getDonorFilter().within(() => {
        cy.get('.q-select__dropdown-icon').click() // close dropdown
      })
      cy.get(paginationInfo).should('contain.text', '1-2 of 2')
    })
    it('should allow filtering by a total amount range', () => {
      cy.visit('/donors')
      cy.wait(['@getDonorList'])
      cy.get(filter).click()
      cy.mockDonorList(
        { page: 1, pageSize: 10, orderBy: { updatedAt: 'desc' } },
        { totalAmount: { gte: 250 } },
      )
      // add minimum amount filter
      getFilterMenu()
        .eq(5)
        .children()
        .eq(1)
        .within(() => {
          cy.get('input').eq(0).type('250')
        })
      cy.get(paginationInfo).should('contain.text', '1-10 of 18')

      cy.mockDonorList(
        { page: 1, pageSize: 10, orderBy: { updatedAt: 'desc' } },
        { totalAmount: { gte: 250, lte: 400 } },
      )
      // add maximum amount filter
      getFilterMenu()
        .eq(5)
        .children()
        .eq(1)
        .within(() => {
          cy.get('input').eq(1).type('400')
        })
      cy.get(paginationInfo).should('contain.text', '1-8 of 8')
    })
  })
})
