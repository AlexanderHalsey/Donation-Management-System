describe('Annual Tax Receipt Create', () => {
  beforeEach(() => {
    cy.mockRefreshToken({})
    cy.mockTaxReceiptList()
    cy.mockEligibleYearOrganisationPairs()
    cy.mockEligibleDonors()
    cy.mockOrganisationRefList()
  })
  it('should display a list of eligible donors for a given year and organisation', () => {
    cy.visitPage('/tax-receipts')
    cy.get('[data-cy=create-annual-tax-receipts-button]').click()
    cy.get('#q-portal--menu--1 .q-menu .q-item').eq(0).click()
    cy.location('pathname').should('include', '/tax-receipts/annual-create/2024/')
    cy.wait(['@getEligibleDonors', '@getOrganisationRefList'])
    cy.get('[data-cy=annual-tax-receipts-create-titles]')
      .should('contain.text', 'Année : 2024')
      .should('contain.text', 'Organisation : Organisation 1')
    cy.get('[data-cy=eligible-donor-row]').should('have.length', 15)
    cy.get('[data-cy=expand-collapse-all-button]').click()
    const rowsToCheck = [0, 7, 14]
    rowsToCheck.forEach((rowIndex) => {
      const donorNumber = (rowIndex + 1) * 2 - 1
      cy.get('[data-cy=eligible-donor-row]')
        .eq(rowIndex)
        .within(() => {
          cy.get('td')
            .eq(1)
            .should('contain.text', `LASTNAME${donorNumber} FirstName${donorNumber}`)
          cy.get('td').eq(2).should('contain.text', `donor${donorNumber}@example.com`)
          cy.get('td')
            .eq(3)
            .should('contain.text', donorNumber === 1 ? 4 : 3)
          cy.get('td')
            .eq(4)
            .should(
              'contain.text',
              `${donorNumber === 1 ? '4' : donorNumber === 15 ? '15' : '27'}0,00 €`,
            )
        })
      cy.get('[data-cy=donor-address-card]')
        .eq(rowIndex)
        .within(() => {
          cy.get('.titled-component').eq(0).should('contain.text', `123 Main St Apt ${donorNumber}`)
          cy.get('.titled-component').eq(1).should('contain.text', `Suite ${donorNumber}`)
          cy.get('.titled-component').eq(2).should('contain.text', `1234${donorNumber}`)
          cy.get('.titled-component').eq(3).should('contain.text', `City ${donorNumber}`)
          cy.get('.titled-component').eq(4).should('contain.text', `State ${donorNumber}`)
          cy.get('.titled-component').eq(5).should('contain.text', `Country ${donorNumber}`)
        })
      cy.get('[data-cy=donation-table]')
        .eq(rowIndex)
        .within(() => {
          cy.get('tbody tr').should('have.length', donorNumber === 1 ? 4 : 3)
        })
    })
  })
  it('should show validation error if no donor is selected', () => {
    cy.visitPage('/tax-receipts')
    cy.get('[data-cy=create-annual-tax-receipts-button]').click()
    cy.get('#q-portal--menu--1 .q-menu .q-item').eq(0).click()
    cy.wait(['@getEligibleDonors', '@getOrganisationRefList'])
    cy.get('[data-cy=form-error-message]').should('not.exist')
    cy.get('[data-cy=create-annual-tax-receipts-button').click()
    cy.get('[data-cy=form-error-message]').should(
      'contain.text',
      'Sélectionnez au moins un donateur',
    )
  })

  it('should create annual tax receipts successfully', () => {
    cy.visitPage('/tax-receipts')
    cy.get('[data-cy=create-annual-tax-receipts-button]').click()
    cy.get('#q-portal--menu--1 .q-menu .q-item').eq(0).click()
    cy.wait(['@getEligibleDonors', '@getOrganisationRefList'])
    cy.get('[data-cy=select-all-checkbox]').click()
    cy.get('[data-cy=create-annual-tax-receipts-button').click()
    cy.mockCreateBulkAnnualTaxReceipts()
    cy.get('.q-dialog').within(() => {
      cy.get('.q-card__section')
        .eq(1)
        .within(() => {
          cy.get('[data-cy=total-created]').should('have.text', '15')
          cy.get('[data-cy=total-sent]').should('have.text', '15')
        })
      cy.get('.q-card__actions button').eq(1).click()
    })
    cy.url().should('match', /\/tax-receipts/)
    cy.get('.q-notification').should(
      'contain.text',
      'Les reçus fiscaux annuels sont en cours de création. Des emails seront envoyés une fois le processus terminé.',
    )
  })

  it('should not allow a standard user to access the page', () => {
    cy.mockRefreshToken({ role: 'standard' })
    cy.visitPage('/tax-receipts/annual-create/2024/1')
    cy.location('pathname').should('not.include', '/tax-receipts/annual-create')
    cy.location('pathname').should('include', '/403')
  })
})
