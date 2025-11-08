/// <reference types="cypress" />

import { buildMockDonations } from './mocks'

import type { DonationListPaginationRequest } from '@shared/models'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject> {
      mockDonationList(pagination?: DonationListPaginationRequest): Chainable<Subject>
    }
  }
}

Cypress.Commands.add('mockDonationList', (pagination?: DonationListPaginationRequest) => {
  if (!pagination) {
    pagination = {
      page: 1,
      pageSize: 10,
      orderBy: { createdAt: 'desc' },
    }
  }
  cy.intercept('POST', '/donations/filtered-list', {
    statusCode: 200,
    body: {
      donations: buildMockDonations(pagination),
      pagination: {
        ...pagination,
        totalCount: 100,
      },
    },
  }).as('getDonationList')
})

export {}
