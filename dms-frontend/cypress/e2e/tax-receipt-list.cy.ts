describe('Tax Receipt List', () => {
  beforeEach(() => {
    cy.mockTaxReceiptList()
  })

  const taxReceiptListTable = '[data-cy="tax-receipt-list-table"]'
  const taxReceiptListHeader = taxReceiptListTable + ' thead tr:first-child'
  const taxReceiptListItem = taxReceiptListTable + ' tbody tr'
  const taxReceiptListFooter = taxReceiptListTable + ' .q-table__bottom'
  const pageSizeSelect = taxReceiptListFooter + ' .q-table__control:nth-child(2) label'
  const paginationInfo = taxReceiptListFooter + ' .q-table__control:nth-child(3) span'
  const paginationControls = taxReceiptListFooter + ' .q-table__control:nth-child(3) button'
  const filter = '[data-cy="tax-receipt-list-filter"]'

  it('displays the tax receipt list and its various states correctly', () => {
    cy.visit('/tax-receipts')
    cy.wait(['@getTaxReceiptList'])
    cy.get(taxReceiptListItem).should('have.length', 10)
    // canceled receipt item
    cy.get(taxReceiptListItem)
      .first()
      .within(() => {
        cy.get('td').eq(0).should('contain.text', '1099')
        cy.get('td').eq(1).should('contain.text', 'LASTNAME10 FirstName10')
        cy.get('td').eq(2).should('contain.text', '09/04/2024')
        cy.get('td').eq(3).should('contain.text', 'Individuel')
        cy.get('td').eq(4).should('contain.text', 'tax-receipt-100.pdf')
        cy.get('td').eq(5).find('.q-icon').should('have.class', 'text-grey')
        cy.get('td').eq(6).click()
      })
    cy.get('[id^=q-portal--menu--]')
      .find('.q-item')
      .should('have.length', 1)
      .should('contain.text', "Afficher l'annulation")
    // completed receipt item
    cy.get(taxReceiptListItem)
      .eq(1)
      .within(() => {
        cy.get('td').eq(0).should('contain.text', '1098')
        cy.get('td').eq(1).should('contain.text', 'LASTNAME9 FirstName9')
        cy.get('td').eq(2).should('contain.text', '08/04/2024')
        cy.get('td').eq(3).should('contain.text', 'Annuel')
        cy.get('td').eq(4).should('contain.text', 'tax-receipt-99.pdf')
        cy.get('td').eq(5).find('.q-icon').should('have.class', 'text-green')
        cy.get('td').eq(6).click()
      })
    cy.get('[id^=q-portal--menu--]')
      .find('.q-item')
      .should('have.length', 1)
      .should('contain.text', 'Annuler')
    // failed receipt item
    cy.get(taxReceiptListItem)
      .eq(2)
      .within(() => {
        cy.get('td').eq(0).should('contain.text', '1097')
        cy.get('td').eq(1).should('contain.text', 'LASTNAME8 FirstName8')
        cy.get('td').eq(2).should('contain.text', '07/04/2024')
        cy.get('td').eq(3).should('contain.text', 'Individuel')
        cy.get('td').eq(4).should('contain.text', 'tax-receipt-98.pdf')
        cy.get('td').eq(5).find('.q-icon').should('have.class', 'text-red')
        cy.get('td').eq(6).click()
      })
    cy.get('[id^=q-portal--menu--]')
      .find('.q-item')
      .should('have.length', 2)
      .eq(0)
      .should('contain.text', 'Réessayer')
      .next()
      .should('contain.text', 'Annuler')
    // processing receipt item
    cy.get(taxReceiptListItem)
      .eq(3)
      .within(() => {
        cy.get('td').eq(0).should('contain.text', '1096')
        cy.get('td').eq(1).should('contain.text', 'LASTNAME7 FirstName7')
        cy.get('td').eq(2).should('contain.text', '06/04/2024')
        cy.get('td').eq(3).should('contain.text', 'Annuel')
        cy.get('td').eq(4).should('contain.text', 'tax-receipt-97.pdf')
        cy.get('td').eq(5).find('.q-icon').should('have.class', 'text-amber')
        cy.get('td').eq(6).find('button').should('not.be.visible')
      })
    // pending receipt item
    cy.get(taxReceiptListItem)
      .eq(4)
      .within(() => {
        cy.get('td').eq(0).should('contain.text', '1095')
        cy.get('td').eq(1).should('contain.text', 'LASTNAME6 FirstName6')
        cy.get('td').eq(2).should('contain.text', '05/04/2024')
        cy.get('td').eq(3).should('contain.text', 'Individuel')
        cy.get('td').eq(4).should('contain.text', 'tax-receipt-96.pdf')
        cy.get('td').eq(5).find('.q-icon').should('have.class', 'text-blue')
        cy.get('td').eq(6).find('button').should('not.be.visible')
      })
  })
  it('allows the user to navigate pages', () => {
    cy.visit('/tax-receipts')
    cy.wait('@getTaxReceiptList')
    cy.get(paginationInfo).should('contain.text', '1-10 of 100')

    cy.mockTaxReceiptList({ page: 2, pageSize: 10, orderBy: { createdAt: 'desc' } })
    cy.get(paginationControls).eq(2).click() // Go to next page
    cy.wait('@getTaxReceiptList')
    cy.get(taxReceiptListItem).should('have.length', 10)
    cy.get(paginationInfo).should('contain.text', '11-20 of 100')

    cy.mockTaxReceiptList({ page: 10, pageSize: 10, orderBy: { createdAt: 'desc' } })
    cy.get(paginationControls).eq(3).click() // Go to end page
    cy.wait('@getTaxReceiptList')
    cy.get(taxReceiptListItem).should('have.length', 10)
    cy.get(paginationInfo).should('contain.text', '91-100 of 100')

    cy.mockTaxReceiptList({ page: 9, pageSize: 10, orderBy: { createdAt: 'desc' } })
    cy.get(paginationControls).eq(1).click() // Go to previous page
    cy.wait('@getTaxReceiptList')
    cy.get(taxReceiptListItem).should('have.length', 10)
    cy.get(paginationInfo).should('contain.text', '81-90 of 100')

    cy.mockTaxReceiptList({ page: 1, pageSize: 10, orderBy: { createdAt: 'desc' } })
    cy.get(paginationControls).eq(0).click() // Go to first page
    cy.wait('@getTaxReceiptList')
    cy.get(taxReceiptListItem).should('have.length', 10)
    cy.get(paginationInfo).should('contain.text', '1-10 of 100')
  })
  it('allows the user to change page size', () => {
    cy.visit('/tax-receipts')
    cy.wait('@getTaxReceiptList')
    cy.get(paginationInfo).should('contain.text', '1-10 of 100')

    cy.mockTaxReceiptList({ page: 2, pageSize: 10, orderBy: { createdAt: 'desc' } })
    cy.get(paginationControls).eq(2).click() // Go to next page
    cy.wait('@getTaxReceiptList')
    cy.get(taxReceiptListItem).should('have.length', 10)
    cy.get(paginationInfo).should('contain.text', '11-20 of 100')

    cy.get(pageSizeSelect).should('contain.text', '10').click()
    cy.mockTaxReceiptList({ page: 1, pageSize: 50, orderBy: { createdAt: 'desc' } })
    cy.get('#q-portal--menu--1 .q-item').eq(3).click() // Select 50 rows per page
    cy.wait('@getTaxReceiptList')
    cy.get(taxReceiptListItem).should('have.length', 50)
    cy.get(paginationInfo).should('contain.text', '1-50 of 100')
  })
  it('allows the user to sort certain columns', () => {
    cy.visit('/tax-receipts')
    cy.wait('@getTaxReceiptList')
    cy.get(taxReceiptListHeader).within(() => {
      cy.mockTaxReceiptList({ page: 1, pageSize: 10, orderBy: { donor: { lastName: 'asc' } } })
      cy.get('th').eq(1).click() // Sort by Donor ascending
      cy.wait('@getTaxReceiptList')
    })
    cy.get(taxReceiptListItem)
      .first()
      .within(() => {
        cy.get('td').eq(1).should('contain.text', 'LASTNAME1 FirstName1')
      })
    cy.get(taxReceiptListHeader).within(() => {
      cy.mockTaxReceiptList({ page: 1, pageSize: 10, orderBy: { donor: { lastName: 'desc' } } })
      cy.get('th').eq(1).click() // Sort by Donor descending
      cy.wait('@getTaxReceiptList')
    })
    cy.get(taxReceiptListItem)
      .first()
      .within(() => {
        cy.get('td').eq(1).should('contain.text', 'LASTNAME9 FirstName9')
      })
    cy.get(taxReceiptListHeader).within(() => {
      cy.mockTaxReceiptList({ page: 1, pageSize: 10, orderBy: { type: 'asc' } })
      cy.get('th').eq(3).click() // Sort by Tax Receipt Type ascending
      cy.wait('@getTaxReceiptList')
    })
    cy.get(taxReceiptListItem)
      .first()
      .within(() => {
        cy.get('td').eq(3).should('contain.text', 'Annuel')
      })
    cy.get(taxReceiptListHeader).within(() => {
      cy.mockTaxReceiptList({ page: 1, pageSize: 10, orderBy: { type: 'desc' } })
      cy.get('th').eq(3).click() // Sort by Tax Receipt Type descending
      cy.wait('@getTaxReceiptList')
    })
    cy.get(taxReceiptListItem)
      .first()
      .within(() => {
        cy.get('td').eq(3).should('contain.text', 'Individuel')
      })
  })
  it('should allow retrying a failed tax receipt from the list', () => {
    cy.visit('/tax-receipts')
    cy.wait('@getTaxReceiptList')
    cy.get(taxReceiptListItem)
      .eq(2)
      .within(() => {
        cy.get('td').eq(6).click()
      })
    cy.mockRetryFailedTaxReceipt()
    cy.mockTaxReceiptList()
    cy.get('#q-portal--menu--1 .q-list').within(() => {
      cy.get('.q-item').eq(0).contains('Réessayer').click()
    })
    cy.get('.q-notification').should('contain.text', 'Le reçu fiscal a été régénéré avec succès.')
  })
  it('should allow cancelling a tax receipt from the list', () => {
    cy.visit('/tax-receipts')
    cy.wait('@getTaxReceiptList')
    cy.get(taxReceiptListItem)
      .eq(2)
      .within(() => {
        cy.get('td').eq(6).find('button').click()
      })
    cy.get('#q-portal--menu--1 .q-list').within(() => {
      cy.get('.q-item').eq(1).contains('Annuler').click()
    })
    cy.get('.q-dialog').within(() => {
      cy.get('button').eq(1).contains('Confirmer').click()
      cy.get('.q-field--error .q-field__bottom .q-field__messages')
        .should('have.length', 1)
        .should('have.text', 'Obligatoire')
      cy.get('textarea').type('Duplicate tax receipt issued.')
      cy.mockCancelTaxReceipt()
      cy.mockTaxReceiptList()
      cy.get('button').eq(1).contains('Confirmer').click()
    })
    cy.wait(['@cancelTaxReceipt', '@getTaxReceiptList'])
    cy.get('.q-notification').should('contain.text', 'Le reçu fiscal a été annulé avec succès.')
  })
  describe('Filters', () => {
    const getFilterMenu = () => cy.get('#q-portal--menu--1 .q-menu').children().eq(0).children()
    it('should allow filtering by donor name', () => {
      const getDonorFilter = () => getFilterMenu().eq(1).children().eq(0).children().eq(1)
      cy.visit('/tax-receipts')
      cy.wait('@getTaxReceiptList')
      cy.get(filter).click()
      cy.mockTaxReceiptList(
        { page: 1, pageSize: 10, orderBy: { createdAt: 'desc' } },
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
      cy.mockTaxReceiptList(
        { page: 1, pageSize: 10, orderBy: { createdAt: 'desc' } },
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
      cy.visit('/tax-receipts')
      cy.wait('@getTaxReceiptList')
      cy.get(filter).click()
      cy.mockTaxReceiptList(
        { page: 1, pageSize: 10, orderBy: { createdAt: 'desc' } },
        { createdAt: { gte: new Date(2024, 1, 1) } },
      )
      // add start date filter
      getFilterMenu()
        .eq(3)
        .children()
        .eq(1)
        .children()
        .eq(0)
        .within(() => {
          cy.get('input').type('01022024')
        })

      cy.get(paginationInfo).should('contain.text', '1-10 of 69')

      cy.mockTaxReceiptList(
        { page: 1, pageSize: 10, orderBy: { createdAt: 'desc' } },
        { createdAt: { gte: new Date(2024, 1, 1), lte: new Date(2024, 2, 5) } },
      )
      // add end date filter
      getFilterMenu()
        .eq(3)
        .children()
        .eq(1)
        .children()
        .eq(1)
        .within(() => {
          cy.get('input').type('05032024')
        })
      cy.get(paginationInfo).should('contain.text', '1-10 of 34')
    })
    it('should allow filtering by tax receipt type', () => {
      const getTaxReceiptTypeFilter = () => getFilterMenu().eq(1).children().eq(2).children().eq(1)
      cy.visit('/tax-receipts')
      cy.wait('@getTaxReceiptList')
      cy.get(filter).click()
      cy.mockTaxReceiptList(
        { page: 1, pageSize: 10, orderBy: { createdAt: 'desc' } },
        { type: { equals: 'ANNUAL' } },
      )
      getTaxReceiptTypeFilter().within(() => {
        cy.get('.q-select__dropdown-icon').click()
      })
      // select Annual as filter
      cy.get('[id^=q-portal--menu--]').eq(1).find('.q-item').eq(0).click()
      getTaxReceiptTypeFilter().within(() => {
        cy.get('.q-select__dropdown-icon').click() // close dropdown
      })
      cy.get(paginationInfo).should('contain.text', '1-10 of 50')
      cy.mockTaxReceiptList(
        { page: 1, pageSize: 10, orderBy: { createdAt: 'desc' } },
        { type: { equals: 'INDIVIDUAL' } },
      )
      // select Individual as filter instead
      getTaxReceiptTypeFilter().within(() => {
        cy.get('.q-select__dropdown-icon').click()
      })
      cy.get('[id^=q-portal--menu--]').eq(1).find('.q-item').eq(1).click()
      getTaxReceiptTypeFilter().within(() => {
        cy.get('.q-select__dropdown-icon').click() // close dropdown
      })
      cy.get(paginationInfo).should('contain.text', '1-10 of 50')
    })
    it('should allow filtering by tax receipt status', () => {
      const getStatusFilter = () => getFilterMenu().eq(5).children().eq(0).children().eq(1)
      cy.visit('/tax-receipts')
      cy.wait('@getTaxReceiptList')
      cy.get(filter).click()
      cy.mockTaxReceiptList(
        { page: 1, pageSize: 10, orderBy: { createdAt: 'desc' } },
        {
          status: { in: ['CANCELED'] },
        },
      )
      // select status canceled as filter
      getStatusFilter().within(() => {
        cy.get('.q-select__dropdown-icon').click()
      })
      cy.get('[id^=q-portal--menu--]').eq(1).find('.q-item').eq(0).click()
      getStatusFilter().within(() => {
        cy.get('.q-select__dropdown-icon').click() // close dropdown
      })
      cy.get(paginationInfo).should('contain.text', '1-10 of 20')
      // select status processing as filter too
      cy.mockTaxReceiptList(
        { page: 1, pageSize: 10, orderBy: { createdAt: 'desc' } },
        {
          status: { in: ['CANCELED', 'PROCESSING'] },
        },
      )
      getStatusFilter().within(() => {
        cy.get('.q-select__dropdown-icon').click()
      })
      cy.get('[id^=q-portal--menu--]').eq(1).find('.q-item').eq(1).click()
      getStatusFilter().within(() => {
        cy.get('.q-select__dropdown-icon').click() // close dropdown
      })
      cy.get(paginationInfo).should('contain.text', '1-10 of 40')
      // select status failed as filter too
      cy.mockTaxReceiptList(
        { page: 1, pageSize: 10, orderBy: { createdAt: 'desc' } },
        {
          status: { in: ['CANCELED', 'PROCESSING', 'FAILED'] },
        },
      )
      getStatusFilter().within(() => {
        cy.get('.q-select__dropdown-icon').click()
      })
      cy.get('[id^=q-portal--menu--]').eq(1).find('.q-item').eq(2).click()
      getStatusFilter().within(() => {
        cy.get('.q-select__dropdown-icon').click() // close dropdown
      })
      cy.get(paginationInfo).should('contain.text', '1-10 of 60')
      // now remove status from filter
      cy.mockTaxReceiptList({ page: 1, pageSize: 10, orderBy: { createdAt: 'desc' } })
      getStatusFilter().within(() => {
        cy.get('.q-select__dropdown-icon').click()
      })
      cy.get('[id^=q-portal--menu--]').eq(1).find('.q-item').eq(2).click()
      cy.get('[id^=q-portal--menu--]').eq(1).find('.q-item').eq(1).click()
      cy.get('[id^=q-portal--menu--]').eq(1).find('.q-item').eq(0).click()
      getStatusFilter().within(() => {
        cy.get('.q-select__dropdown-icon').click() // close dropdown
      })
      cy.get(paginationInfo).should('contain.text', '1-10 of 100')
    })
  })
})
