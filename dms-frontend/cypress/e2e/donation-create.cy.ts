describe('Donation Create', () => {
  beforeEach(() => {
    cy.mockDonorRefList()
    cy.mockOrganisationRefList()
    cy.mockDonationTypeList()
    cy.mockPaymentModeList()
    cy.mockDonationMethodList()
    cy.mockDonationAssetTypeList()
  })

  const createDonationBtn = '[data-cy="create-donation"]'
  const formField = '[data-cy="form-field"]'

  it('should initialise an empty form', () => {
    cy.visit('/donations/create')
    cy.wait([
      '@getOrganisationRefList',
      '@getDonationTypeList',
      '@getPaymentModeList',
      '@getDonationMethodList',
      '@getDonationAssetTypeList',
    ])
    cy.get(formField)
      .should('have.length', 8)
      .each(($el) => {
        cy.wrap($el).find('.q-field, select, textarea').should('have.value', '')
      })
  })

  it('should show validation errors', () => {
    cy.visit('/donations/create')
    cy.wait([
      '@getOrganisationRefList',
      '@getDonationTypeList',
      '@getPaymentModeList',
      '@getDonationMethodList',
      '@getDonationAssetTypeList',
    ])
    cy.get(createDonationBtn).click()

    cy.get('.q-field--error .q-field__bottom .q-field__messages')
      .should('have.length', 6)
      .each(($el) => {
        cy.wrap($el).should('have.text', 'Obligatoire')
      })
  })

  it('should additionally validate compatibility between organisations and donation types', () => {
    cy.visit('/donations/create')
    cy.wait([
      '@getOrganisationRefList',
      '@getDonationTypeList',
      '@getPaymentModeList',
      '@getDonationMethodList',
      '@getDonationAssetTypeList',
    ])

    cy.get(formField).eq(0).find('.q-field').click()
    cy.get('[id^=q-portal--menu--]').find('.q-item').eq(0).click() // Select first donor
    cy.get(formField).eq(1).find('.q-field').type('15122024') // Donation date
    cy.get(formField).eq(2).find('.q-field').type('100') // Amount
    cy.get(formField).eq(3).find('.q-field').click()
    cy.get('[id^=q-portal--menu--]').find('.q-item').eq(0).click() // Select first organisation
    cy.get(formField).eq(4).find('.q-field').click()
    cy.get('[id^=q-portal--menu--]').find('.q-item').eq(1).click() // Select second donation type (incompatible)
    cy.get(formField).eq(5).find('.q-field').click()
    cy.get('[id^=q-portal--menu--]').eq(1).find('.q-item').eq(0).click() // Select first payment mode

    cy.get(createDonationBtn).click()

    cy.get(formField)
      .eq(3)
      .find('.q-field__bottom .q-field__messages')
      .should('have.text', "Le type de don sélectionné n'appartient pas à l'organisation choisie.")
    cy.get(formField)
      .eq(4)
      .find('.q-field__bottom .q-field__messages')
      .should('have.text', "Le type de don sélectionné n'appartient pas à l'organisation choisie.")
  })

  it('should submit the form successfully', () => {
    cy.visit('/donations/create')
    cy.wait([
      '@getOrganisationRefList',
      '@getDonationTypeList',
      '@getPaymentModeList',
      '@getDonationMethodList',
      '@getDonationAssetTypeList',
    ])

    cy.get(formField).eq(0).find('.q-field').click()
    cy.get('[id^=q-portal--menu--]').find('.q-item').eq(0).click() // Select first donor
    cy.get(formField).eq(1).find('.q-field').type('15122024') // Donation date
    cy.get(formField).eq(2).find('.q-field').type('100') // Amount
    cy.get(formField).eq(3).find('.q-field').click()
    cy.get('[id^=q-portal--menu--]').find('.q-item').eq(0).click() // Select first organisation
    cy.get(formField).eq(4).find('.q-field').click()
    cy.get('[id^=q-portal--menu--]').find('.q-item').eq(0).click() // Select first donation type (compatible)
    cy.get(formField).eq(5).find('.q-field').click()
    cy.get('[id^=q-portal--menu--]').eq(1).find('.q-item').eq(0).click() // Select first payment mode

    cy.mockDonationList()
    cy.mockCreateDonation({
      donatedAt: new Date(2024, 11, 15),
      amount: 100,
      organisationId: 'org-1',
      donationTypeId: 'donation-type-1',
      paymentModeId: 'payment-mode-1',
      donorId: 'donor-1',
      donationMethodId: 'method-1',
      donationAssetTypeId: 'asset-type-1',
    })
    cy.get(createDonationBtn).click()

    cy.location('pathname').should('eq', '/donations')
    cy.get('.q-notification .q-notification__message').should(
      'have.text',
      'Le don a été créé avec succès.',
    )
  })
})
