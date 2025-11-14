describe('Donation List', () => {
  beforeEach(() => {
    cy.mockDonationList()
    cy.mockOrganisationRefList()
  })

  const donationListTable = '.donation-list-table'
  const donationListHeader = donationListTable + ' thead tr:first-child'
  const donationListItem = donationListTable + ' tbody tr'
  const donationListFooter = donationListTable + ' .q-table__bottom'
  const pageSizeSelect = donationListFooter + ' .q-table__control:nth-child(2) label'
  const paginationInfo = donationListFooter + ' .q-table__control:nth-child(3) span'
  const paginationControls = donationListFooter + ' .q-table__control:nth-child(3) button'
  const filter = '[data-cy="donation-list-filter"]'

  it('displays the donation list', () => {
    cy.visit('/donations')
    cy.wait(['@getDonationList', '@getOrganisationRefList'])
    cy.get(donationListItem).should('have.length', 10)
    cy.get(donationListItem)
      .first()
      .within(() => {
        cy.get('td').eq(0).should('contain.text', 'LASTNAME10 FirstName10')
        cy.get('td').eq(1).should('contain.text', '09/04/2024')
        cy.get('td').eq(2).should('contain.text', '100.00 €')
        cy.get('td').eq(3).should('contain.text', 'Payment Mode 4')
        cy.get('td').eq(4).should('contain.text', 'Organisation 2')
        cy.get('td').eq(5).should('contain.text', 'Donation Type 10')
      })
    cy.get(donationListItem)
      .eq(3)
      .within(() => {
        cy.get('td').eq(0).should('contain.text', 'LASTNAME7 FirstName7')
        cy.get('td').eq(1).should('contain.text', '06/04/2024')
        cy.get('td').eq(2).should('contain.text', '70.00 €')
        cy.get('td').eq(3).should('contain.text', 'Payment Mode 1')
        cy.get('td').eq(4).should('contain.text', 'Organisation 1')
        cy.get('td').eq(5).should('contain.text', 'Donation Type 7')
      })
    cy.get(donationListItem)
      .eq(7)
      .within(() => {
        cy.get('td').eq(0).should('contain.text', 'LASTNAME3 FirstName3')
        cy.get('td').eq(1).should('contain.text', '02/04/2024')
        cy.get('td').eq(2).should('contain.text', '30.00 €')
        cy.get('td').eq(3).should('contain.text', 'Payment Mode 1')
        cy.get('td').eq(4).should('contain.text', 'Organisation 1')
        cy.get('td').eq(5).should('contain.text', 'Donation Type 3')
      })
  })
  it('allows the user to navigate pages', () => {
    cy.visit('/donations')
    cy.wait(['@getDonationList', '@getOrganisationRefList'])
    cy.get(paginationInfo).should('contain.text', '1-10 of 96')

    cy.mockDonationList({ page: 2, pageSize: 10, orderBy: { updatedAt: 'desc' } })
    cy.get(paginationControls).eq(2).click() // Go to next page
    cy.wait(['@getDonationList'])
    cy.get(donationListItem).should('have.length', 10)
    cy.get(paginationInfo).should('contain.text', '11-20 of 96')

    cy.mockDonationList({ page: 10, pageSize: 10, orderBy: { updatedAt: 'desc' } })
    cy.get(paginationControls).eq(3).click() // Go to end page
    cy.wait(['@getDonationList'])
    cy.get(donationListItem).should('have.length', 6)
    cy.get(paginationInfo).should('contain.text', '91-96 of 96')

    cy.mockDonationList({ page: 9, pageSize: 10, orderBy: { updatedAt: 'desc' } })
    cy.get(paginationControls).eq(1).click() // Go to previous page
    cy.wait(['@getDonationList'])
    cy.get(donationListItem).should('have.length', 10)
    cy.get(paginationInfo).should('contain.text', '81-90 of 96')

    cy.mockDonationList({ page: 1, pageSize: 10, orderBy: { updatedAt: 'desc' } })
    cy.get(paginationControls).eq(0).click() // Go to first page
    cy.wait(['@getDonationList'])
    cy.get(donationListItem).should('have.length', 10)
    cy.get(paginationInfo).should('contain.text', '1-10 of 96')
  })
  it('allows the user to change page size', () => {
    cy.visit('/donations')
    cy.wait(['@getDonationList', '@getOrganisationRefList'])
    cy.get(paginationInfo).should('contain.text', '1-10 of 96')

    cy.mockDonationList({ page: 2, pageSize: 10, orderBy: { updatedAt: 'desc' } })
    cy.get(paginationControls).eq(2).click() // Go to next page
    cy.wait(['@getDonationList'])
    cy.get(donationListItem).should('have.length', 10)
    cy.get(paginationInfo).should('contain.text', '11-20 of 96')

    cy.get(pageSizeSelect).should('contain.text', '10').click()
    cy.mockDonationList({ page: 1, pageSize: 50, orderBy: { updatedAt: 'desc' } })
    cy.get('#q-portal--menu--1 .q-item').eq(3).click() // Select 50 rows per page
    cy.wait(['@getDonationList'])
    cy.get(donationListItem).should('have.length', 50)
    cy.get(paginationInfo).should('contain.text', '1-50 of 96')
  })
  it('allows the user to sort certain columns', () => {
    cy.visit('/donations')
    cy.wait(['@getDonationList', '@getOrganisationRefList'])
    cy.get(donationListHeader).within(() => {
      cy.mockDonationList({ page: 1, pageSize: 10, orderBy: { amount: 'asc' } })
      cy.get('th').eq(2).click() // Sort by Amount ascending
      cy.wait(['@getDonationList'])
    })
    cy.get(donationListItem)
      .first()
      .within(() => {
        cy.get('td').eq(2).should('contain.text', '10.00 €')
      })
    cy.get(donationListHeader).within(() => {
      cy.mockDonationList({ page: 1, pageSize: 10, orderBy: { amount: 'desc' } })
      cy.get('th').eq(2).click() // Sort by Amount descending
      cy.wait(['@getDonationList'])
    })
    cy.get(donationListItem)
      .first()
      .within(() => {
        cy.get('td').eq(2).should('contain.text', '100.00 €')
      })
    cy.get(donationListHeader).within(() => {
      cy.mockDonationList({ page: 1, pageSize: 10, orderBy: { organisation: { name: 'asc' } } })
      cy.get('th').eq(4).click() // Sort by Organisation ascending
      cy.wait(['@getDonationList'])
    })
    cy.get(donationListItem)
      .first()
      .within(() => {
        cy.get('td').eq(4).should('contain.text', 'Organisation 1')
      })
    cy.get(donationListHeader).within(() => {
      cy.mockDonationList({ page: 1, pageSize: 10, orderBy: { organisation: { name: 'desc' } } })
      cy.get('th').eq(4).click() // Sort by Organisation descending
      cy.wait(['@getDonationList'])
    })
    cy.get(donationListItem)
      .first()
      .within(() => {
        cy.get('td').eq(4).should('contain.text', 'Organisation 2')
      })
  })
  it('should allow a user to navigate to the user update page', () => {
    cy.visit('/donations')
    cy.wait(['@getDonationList', '@getOrganisationRefList'])
    cy.mockDonation(3)
    cy.get(donationListItem)
      .eq(3)
      .within(() => {
        cy.get('td').eq(6).find('button').click() // Click action button
      })
    cy.get('#q-portal--menu--1 .q-item').eq(0).click() // Click edit action
    cy.url().should('match', /\/donations\/[a-f0-9\-]{36}$/)
  })
  describe('Filters', () => {
    const getFilterMenu = () =>
      cy.get('#q-portal--menu--1 .q-menu').children().eq(0).children().eq(1).children()
    it('should allow filtering by donor name', () => {
      const getDonorFilter = () => getFilterMenu().eq(0).children().eq(0)
      cy.visit('/donations')
      cy.wait(['@getDonationList', '@getOrganisationRefList'])
      cy.get(filter).click()
      cy.mockDonationList(
        { page: 1, pageSize: 10, orderBy: { updatedAt: 'desc' } },
        { donorId: { in: [0] } },
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
      cy.get(paginationInfo).should('contain.text', '1-4 of 4')
      cy.mockDonationList(
        { page: 1, pageSize: 10, orderBy: { updatedAt: 'desc' } },
        { donorId: { in: [0, 1] } },
      )
      getDonorFilter().within(() => {
        cy.get('.q-select__dropdown-icon').click()
      })
      // select donor 2 as filter too
      cy.get('[id^=q-portal--menu--]').eq(1).find('.q-item').eq(1).click()
      getDonorFilter().within(() => {
        cy.get('.q-select__dropdown-icon').click() // close dropdown
      })
      cy.get(paginationInfo).should('contain.text', '1-8 of 8')
    })
    it('should allow filtering by a date range', () => {
      cy.visit('/donations')
      cy.wait(['@getDonationList', '@getOrganisationRefList'])
      cy.get(filter).click()
      cy.mockDonationList(
        { page: 1, pageSize: 10, orderBy: { updatedAt: 'desc' } },
        { donatedAt: { gte: new Date(2024, 1, 1) } },
      )
      // add start date filter
      getFilterMenu()
        .eq(2)
        .children()
        .eq(0)
        .within(() => {
          cy.get('input').eq(0).type('01022024')
        })
      cy.get(paginationInfo).should('contain.text', '1-10 of 69')

      cy.mockDonationList(
        { page: 1, pageSize: 10, orderBy: { updatedAt: 'desc' } },
        { donatedAt: { gte: new Date(2024, 1, 1), lte: new Date(2024, 2, 5) } },
      )
      // add end date filter
      getFilterMenu()
        .eq(2)
        .children()
        .eq(0)
        .within(() => {
          cy.get('input').eq(1).type('05032024')
        })
      cy.get(paginationInfo).should('contain.text', '1-10 of 34')
    })
    it('should allow filtering by an amount range', () => {
      cy.visit('/donations')
      cy.wait(['@getDonationList', '@getOrganisationRefList'])
      cy.get(filter).click()
      cy.mockDonationList(
        { page: 1, pageSize: 10, orderBy: { updatedAt: 'desc' } },
        { amount: { gte: 40 } },
      )
      // add minimum amount filter
      getFilterMenu()
        .eq(2)
        .children()
        .eq(2)
        .within(() => {
          cy.get('input').eq(0).type('40')
        })
      cy.get(paginationInfo).should('contain.text', '1-10 of 70')

      cy.mockDonationList(
        { page: 1, pageSize: 10, orderBy: { updatedAt: 'desc' } },
        { amount: { gte: 40, lte: 70 } },
      )
      // add maximum amount filter
      getFilterMenu()
        .eq(2)
        .children()
        .eq(2)
        .within(() => {
          cy.get('input').eq(1).type('70')
        })
      cy.get(paginationInfo).should('contain.text', '1-10 of 40')
    })
    it('should allow filtering by payment mode', () => {
      const getPaymentModeFilter = () => getFilterMenu().eq(0).children().eq(2)
      cy.visit('/donations')
      cy.wait(['@getDonationList', '@getOrganisationRefList'])
      cy.get(filter).click()
      cy.mockDonationList(
        { page: 1, pageSize: 10, orderBy: { updatedAt: 'desc' } },
        { paymentModeId: { in: [0] } },
      )
      cy.mockPaymentModeList()
      getPaymentModeFilter().within(() => {
        cy.get('.q-select__dropdown-icon').click()
      })
      cy.wait(['@getPaymentModeList'])
      // select payment mode 1 as filter
      cy.get('[id^=q-portal--menu--]').eq(1).find('.q-item').eq(0).click()
      getPaymentModeFilter().within(() => {
        cy.get('.q-select__dropdown-icon').click() // close dropdown
      })
      cy.get(paginationInfo).should('contain.text', '1-10 of 25')
      cy.mockDonationList(
        { page: 1, pageSize: 10, orderBy: { updatedAt: 'desc' } },
        { paymentModeId: { in: [0, 1] } },
      )
      // select payment mode 2 as filter too
      getPaymentModeFilter().within(() => {
        cy.get('.q-select__dropdown-icon').click()
      })
      cy.get('[id^=q-portal--menu--]').eq(1).find('.q-item').eq(1).click()
      getPaymentModeFilter().within(() => {
        cy.get('.q-select__dropdown-icon').click() // close dropdown
      })
      cy.get(paginationInfo).should('contain.text', '1-10 of 50')
    })
    it('should allow filtering by organisation', () => {
      const getOrganisationFilter = () => getFilterMenu().eq(0).children().eq(4)
      cy.visit('/donations')
      cy.wait(['@getDonationList', '@getOrganisationRefList'])
      cy.get(filter).click()
      cy.mockDonationList(
        { page: 1, pageSize: 10, orderBy: { updatedAt: 'desc' } },
        { organisationId: { in: [0] } },
      )
      getOrganisationFilter().within(() => {
        cy.get('.q-select__dropdown-icon').click()
      })
      // select organisation 1 as filter
      cy.get('[id^=q-portal--menu--]').eq(1).find('.q-item').eq(0).click()
      getOrganisationFilter().within(() => {
        cy.get('.q-select__dropdown-icon').click() // close dropdown
      })
      cy.get(paginationInfo).should('contain.text', '1-10 of 50')
    })
    it('should allow filtering by donation type', () => {
      const getDonationTypeFilter = () => getFilterMenu().eq(2).children().eq(4).children().eq(0)
      cy.visit('/donations')
      cy.wait(['@getDonationList', '@getOrganisationRefList'])
      cy.get(filter).click()
      cy.mockDonationList(
        { page: 1, pageSize: 10, orderBy: { updatedAt: 'desc' } },
        { donationTypeId: { in: [0] } },
      )
      cy.mockDonationTypeList()
      getDonationTypeFilter().within(() => {
        cy.get('.q-select__dropdown-icon').click()
      })
      cy.wait(['@getDonationTypeList'])
      // select donation type 1 as filter
      cy.get('[id^=q-portal--menu--]').eq(1).find('.q-item').eq(0).click()
      getDonationTypeFilter().within(() => {
        cy.get('.q-select__dropdown-icon').click() // close dropdown
      })
      cy.get(paginationInfo).should('contain.text', '1-10 of 10')
      cy.mockDonationList(
        { page: 1, pageSize: 10, orderBy: { updatedAt: 'desc' } },
        { donationTypeId: { in: [0, 3] } },
      )
      // select donation type 3 as filter too
      getDonationTypeFilter().within(() => {
        cy.get('.q-select__dropdown-icon').click()
      })
      cy.get('[id^=q-portal--menu--]').eq(1).find('.q-item').eq(2).click()
      getDonationTypeFilter().within(() => {
        cy.get('.q-select__dropdown-icon').click() // close dropdown
      })
      cy.get(paginationInfo).should('contain.text', '1-10 of 20')
    })
    it('should allow filtering by toggling isDisabled status', () => {
      const getIncludeDisabledFilter = () => getFilterMenu().eq(2).children().eq(4).children().eq(2)
      cy.visit('/donations')
      cy.wait(['@getDonationList', '@getOrganisationRefList'])
      cy.get(filter).click()
      cy.mockDonationList({ page: 1, pageSize: 10, orderBy: { updatedAt: 'desc' } }, {})
      // select isDisabled = false as filter
      getIncludeDisabledFilter().within(() => {
        cy.get('.q-toggle__thumb').click()
      })
      cy.get(paginationInfo).should('contain.text', '1-10 of 100')
      // now exclude back the disabled donations
      cy.mockDonationList(
        { page: 1, pageSize: 10, orderBy: { updatedAt: 'desc' } },
        {
          isDisabled: { equals: false },
        },
      )
      getIncludeDisabledFilter().within(() => {
        cy.get('.q-toggle__thumb').click()
      })
      cy.get(paginationInfo).should('contain.text', '1-10 of 96')
    })
  })
})
