/// <reference types="cypress" />

import {
  buildMockDonations,
  buildMockDonationTypes,
  buildMockDonors,
  buildMockOrganisations,
  buildMockPaymentModes,
  type DonationListFilterMock,
} from './mocks'
import type { DonationListPaginationRequest } from '@shared/models'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject> {
      mockDonationList(
        pagination?: DonationListPaginationRequest,
        filter?: DonationListFilterMock,
      ): Chainable<Subject>
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
        orderBy: { createdAt: 'desc' },
      }
    }
    const donations = buildMockDonations(pagination, filter ?? { isDisabled: { equals: false } })
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

    const organisations = buildMockOrganisations()

    cy.intercept('GET', '/donations/context', {
      statusCode: 200,
      body: {
        paymentModes: buildMockPaymentModes(),
        organisations,
        donationTypes: buildMockDonationTypes(organisations),
        donors: buildMockDonors(),
      },
    }).as('getDonationListContext')
  },
)
export {}
