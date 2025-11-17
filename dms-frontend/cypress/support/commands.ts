/// <reference types="cypress" />

import {
  buildMockDonations,
  buildMockDonationTypes,
  buildMockDonors,
  buildMockOrganisations,
  buildMockPaymentModes,
  type DonationListFilterMock,
  type DonorListFilterMock,
} from './mocks'
import type { DonationListPaginationRequest, DonorListPaginationRequest } from '@shared/models'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject> {
      mockDonation(index: number): Chainable<Subject>
      mockDonationList(
        pagination?: DonationListPaginationRequest,
        filter?: DonationListFilterMock,
      ): Chainable<Subject>
      mockDonationTypeList(): Chainable<Subject>
      mockDonorList(
        pagination?: DonorListPaginationRequest,
        filter?: DonorListFilterMock,
      ): Chainable<Subject>
      mockDonor(index: number): Chainable<Subject>
      mockDonorRefList(): Chainable<Subject>
      mockOrganisationRefList(): Chainable<Subject>
      mockPaymentModeList(): Chainable<Subject>
    }
  }
}

Cypress.Commands.add(
  'mockDonationList',
  (pagination?: DonationListPaginationRequest, filter?: DonationListFilterMock) => {
    if (!pagination) {
      pagination = {
        page: 1,
        pageSize: 10,
        orderBy: { updatedAt: 'desc' },
      }
    }
    const donations = buildMockDonations(pagination.orderBy, filter)
    cy.intercept('POST', '/donations/filtered-list', {
      statusCode: 200,
      body: {
        donations: donations.slice(
          (pagination.page - 1) * pagination.pageSize,
          pagination.page * pagination.pageSize,
        ),
        pagination: {
          ...pagination,
          totalCount: donations.length,
        },
      },
    }).as('getDonationList')
  },
)

Cypress.Commands.add('mockDonation', (index: number) => {
  const donation = buildMockDonations()[index]
  cy.intercept('GET', '/donations/*', {
    statusCode: 200,
    body: {
      donation,
    },
  }).as('getDonation')
})

const organisations = buildMockOrganisations()
const paymentModes = buildMockPaymentModes()
const donationTypes = buildMockDonationTypes(organisations)

Cypress.Commands.add('mockOrganisationRefList', () => {
  cy.intercept('GET', '/refs/organisations', {
    statusCode: 200,
    body: {
      organisationRefs: organisations,
    },
  }).as('getOrganisationRefList')
})

Cypress.Commands.add('mockPaymentModeList', () => {
  cy.intercept('GET', '/refs/payment-modes', {
    statusCode: 200,
    body: {
      paymentModes,
    },
  }).as('getPaymentModeList')
})

Cypress.Commands.add('mockDonationTypeList', () => {
  cy.intercept('GET', '/refs/donation-types', {
    statusCode: 200,
    body: {
      donationTypes,
    },
  }).as('getDonationTypeList')
})

Cypress.Commands.add('mockDonorRefList', () => {
  const donors = buildMockDonors()
  cy.intercept('GET', '/refs/donors', {
    statusCode: 200,
    body: {
      donorRefs: donors,
    },
  }).as('getDonorRefList')
})

Cypress.Commands.add(
  'mockDonorList',
  (pagination?: DonorListPaginationRequest, filter?: DonorListFilterMock) => {
    const donors = buildMockDonors(pagination?.orderBy, filter)

    cy.intercept('POST', '/donors/filtered-list', {
      statusCode: 200,
      body: {
        donors: donors.slice(
          ((pagination?.page ?? 1) - 1) * (pagination?.pageSize ?? 10),
          (pagination?.page ?? 1) * (pagination?.pageSize ?? 10),
        ),
        pagination: {
          page: pagination?.page ?? 1,
          pageSize: pagination?.pageSize ?? 10,
          totalCount: donors.length,
          orderBy: pagination?.orderBy,
        },
      },
    }).as('getDonorList')
  },
)

Cypress.Commands.add('mockDonor', (index: number) => {
  const donors = buildMockDonors()
  const donor = donors[index]
  cy.intercept('GET', '/donors/*', {
    statusCode: 200,
    body: {
      donor,
    },
  }).as('getDonor')
})

export {}
