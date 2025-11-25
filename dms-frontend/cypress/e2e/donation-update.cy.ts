describe('Donation Update', () => {
  beforeEach(() => {
    cy.mockDonorRefList()
    cy.mockOrganisationRefList()
    cy.mockDonationTypeList()
    cy.mockPaymentModeList()
    cy.mockDonationMethodList()
    cy.mockDonationAssetTypeList()
    cy.mockDonation(0)
  })

  const updateDonationBtn = '[data-cy="update-donation"]'
  const deleteDonationBtn = '[data-cy="delete-donation"]'
  const formField = '[data-cy="form-field"]'

  it('should initialise an existing form', () => {
    cy.visit('/donations/donation-id-1')
    cy.wait([
      '@getDonation',
      '@getOrganisationRefList',
      '@getDonationTypeList',
      '@getPaymentModeList',
      '@getDonationMethodList',
      '@getDonationAssetTypeList',
    ])
    cy.get(formField).eq(0).find('.q-field').should('contain.text', 'LASTNAME1 FirstName1')
    cy.get(formField).eq(1).find('.q-field input').should('have.value', '01/01/2024')
    cy.get(formField).eq(2).find('.q-field input').should('have.value', '10 €')
    cy.get(formField).eq(3).find('.q-field').should('contain.text', 'Organisation 1')
    cy.get(formField).eq(4).find('.q-field').should('contain.text', 'Donation Type 1')
    cy.get(formField).eq(5).find('.q-field').should('contain.text', 'Payment Mode 1')
    cy.get(formField).eq(6).find('.q-field').should('contain.text', 'Donation Method 1')
    cy.get(formField).eq(7).find('.q-field').should('contain.text', 'Donation Asset Type 1')
  })
  it('should show validation errors', () => {
    cy.visit('/donations/donation-id-1')
    cy.wait([
      '@getDonation',
      '@getOrganisationRefList',
      '@getDonationTypeList',
      '@getPaymentModeList',
      '@getDonationMethodList',
      '@getDonationAssetTypeList',
    ])
    cy.get(formField).eq(3).find('.q-field').click() // change organisation
    cy.get('.q-menu .q-item').eq(1).click() // select different organisation

    cy.get(updateDonationBtn).click()

    cy.get('.q-field--error .q-field__bottom .q-field__messages')
      .should('have.length', 2)
      .each(($el) => {
        cy.wrap($el).should(
          'have.text',
          "Le type de don sélectionné n'appartient pas à l'organisation choisie.",
        )
      })
  })
  it('should allow changing various fields', () => {
    cy.visit('/donations/donation-id-1')
    cy.wait([
      '@getDonation',
      '@getOrganisationRefList',
      '@getDonationTypeList',
      '@getPaymentModeList',
      '@getDonationMethodList',
      '@getDonationAssetTypeList',
    ])
    // Change donation date
    cy.get(formField).eq(1).find('input').clear()
    cy.get(formField).eq(1).find('input').type('15022024')

    // Change amount
    cy.get(formField).eq(2).find('input').clear()
    cy.get(formField).eq(2).find('input').type('250')

    // Change organisation
    cy.get(formField).eq(3).find('.q-field').click()
    cy.get('.q-menu .q-item').eq(1).click()

    // Change donation type
    cy.get(formField).eq(4).find('.q-field').click()
    cy.get('.q-menu .q-item').eq(1).click()

    // Change payment mode
    cy.get(formField).eq(5).find('.q-field').click()
    cy.get('.q-menu .q-item').eq(1).click()

    // Change donation method
    cy.get(formField).eq(6).find('.q-field').click()
    cy.get('.q-menu .q-item').eq(1).click()

    // Change donation asset type
    cy.get(formField).eq(7).find('.q-field').click()
    cy.get('.q-menu .q-item').eq(1).click()

    cy.mockDonationList()
    cy.mockUpdateDonation('donation-id-1', {
      donorId: 'donor-ref-1',
      donatedAt: new Date(2024, 1, 15),
      amount: 250,
      organisationId: 'organisation-2',
      donationTypeId: 'donation-type-2',
      paymentModeId: 'payment-mode-2',
      donationMethodId: 'donation-method-2',
      donationAssetTypeId: 'donation-asset-type-2',
    })
    cy.get(updateDonationBtn).click()

    cy.location('pathname').should('eq', '/donations')
    cy.get('.q-notification').should('contain.text', 'Le don a été mis à jour avec succès.')
  })
  it('should allow deleting the donation', () => {
    cy.visit('/donations/donation-id-1')
    cy.wait([
      '@getDonation',
      '@getOrganisationRefList',
      '@getDonationTypeList',
      '@getPaymentModeList',
      '@getDonationMethodList',
      '@getDonationAssetTypeList',
    ])

    cy.get(deleteDonationBtn).click()

    cy.mockDonationList()
    cy.mockDeleteDonation()
    cy.get('.q-dialog .q-btn').eq(1).click() // confirm delete

    cy.location('pathname').should('eq', '/donations')
    cy.get('.q-notification').should('contain.text', 'Le don a été supprimé avec succès.')
  })
})
