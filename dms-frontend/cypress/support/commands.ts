/// <reference types="cypress" />
import { MOCK_API_HOST } from './constants'
import {
  buildMockDonations,
  buildMockDonationAssetTypes,
  buildMockDonationMethods,
  buildMockDonationTypes,
  buildMockDonors,
  buildMockImage,
  buildMockOrganisations,
  buildMockPaymentModes,
  buildMockTaxReceipts,
  type DonationAssetTypeFormDataMock,
  type DonationMethodFormDataMock,
  type DonationTypeFormDataMock,
  type OrganisationFormDataMock,
  type PaymentModeFormDataMock,
  type DonationListFilterMock,
  type DonorListFilterMock,
  type DonationFormDataMock,
  type TaxReceiptListFilterMock,
} from './mocks'
import type {
  DonationListPaginationRequest,
  DonorListPaginationRequest,
  TaxReceiptListPaginationRequest,
} from '@shared/models'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject> {
      mockCreateDonation(formData: DonationFormDataMock): Chainable<Subject>
      mockCreateDonationAssetType(formData: DonationAssetTypeFormDataMock): Chainable<Subject>
      mockCreateDonationMethod(formData: DonationMethodFormDataMock): Chainable<Subject>
      mockCreateDonationType(formData: DonationTypeFormDataMock): Chainable<Subject>
      mockCreatePaymentMode(formData: PaymentModeFormDataMock): Chainable<Subject>
      mockDeleteDonation(): Chainable<Subject>
      mockDisableDonationAssetType(donationAssetTypeId: string): Chainable<Subject>
      mockDisableDonationMethod(donationMethodId: string): Chainable<Subject>
      mockDisableDonationType(donationTypeId: string): Chainable<Subject>
      mockDisablePaymentMode(paymentModeId: string): Chainable<Subject>
      mockDonation(index: number): Chainable<Subject>
      mockDonationAssetType(index: number): Chainable<Subject>
      mockDonationAssetTypeList(): Chainable<Subject>
      mockDonationMethod(index: number): Chainable<Subject>
      mockDonationList(
        pagination?: DonationListPaginationRequest,
        filter?: DonationListFilterMock,
      ): Chainable<Subject>
      mockDonationMethodList(): Chainable<Subject>
      mockDonationType(index: number): Chainable<Subject>
      mockDonationTypeList(): Chainable<Subject>
      mockDonorList(
        pagination?: DonorListPaginationRequest,
        filter?: DonorListFilterMock,
      ): Chainable<Subject>
      mockDonor(index: number): Chainable<Subject>
      mockDonorRefList(): Chainable<Subject>
      mockOrganisation(index: number): Chainable<Subject>
      mockOrganisationList(): Chainable<Subject>
      mockOrganisationRefList(): Chainable<Subject>
      mockCreateOrganisation(formData: OrganisationFormDataMock): Chainable<Subject>
      mockUpdateOrganisation(
        organisationId: string,
        formData: OrganisationFormDataMock,
      ): Chainable<Subject>
      mockDisableOrganisation(organisationId: string): Chainable<Subject>
      mockPaymentMode(index: number): Chainable<Subject>
      mockPaymentModeList(): Chainable<Subject>
      mockTaxReceiptList(
        pagination?: TaxReceiptListPaginationRequest,
        filter?: TaxReceiptListFilterMock,
      ): Chainable<Subject>
      mockUpdateDonation(donationId: string, formData: DonationFormDataMock): Chainable<Subject>
      mockUpdateDonationAssetType(
        donationAssetTypeId: string,
        formData: DonationAssetTypeFormDataMock,
      ): Chainable<Subject>
      mockUpdateDonationMethod(
        donationMethodId: string,
        formData: DonationMethodFormDataMock,
      ): Chainable<Subject>
      mockUpdateDonationType(
        donationTypeId: string,
        formData: DonationTypeFormDataMock,
      ): Chainable<Subject>
      mockUpdatePaymentMode(
        paymentModeId: string,
        formData: PaymentModeFormDataMock,
      ): Chainable<Subject>
      mockUploadImage(): Chainable<Subject>
    }
  }
}

const organisations = buildMockOrganisations()
const paymentModes = buildMockPaymentModes()
const donationTypes = buildMockDonationTypes(organisations)
const donationMethods = buildMockDonationMethods()
const donationAssetTypes = buildMockDonationAssetTypes()
const donors = buildMockDonors()

Cypress.Commands.add('mockOrganisationRefList', () => {
  cy.intercept('GET', `${MOCK_API_HOST}/organisations/refs`, {
    statusCode: 200,
    body: {
      organisationRefs: organisations,
    },
  }).as('getOrganisationRefList')
})

Cypress.Commands.add('mockOrganisation', (index: number) => {
  cy.intercept('GET', `${MOCK_API_HOST}/organisations/*`, {
    statusCode: 200,
    body: {
      organisation: organisations[index],
    },
  }).as('getOrganisation')
})

Cypress.Commands.add('mockOrganisationList', () => {
  cy.intercept('GET', `${MOCK_API_HOST}/organisations`, {
    statusCode: 200,
    body: {
      organisations: organisations,
    },
  }).as('getOrganisationList')
})

Cypress.Commands.add('mockCreateOrganisation', (formData: OrganisationFormDataMock) => {
  cy.intercept('POST', `${MOCK_API_HOST}/organisations`, {
    statusCode: 201,
    body: {
      organisation: {
        id: 'new-organisation-id',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDisabled: false,
        ...formData,
      },
    },
  }).as('createOrganisation')
})

Cypress.Commands.add(
  'mockUpdateOrganisation',
  (organisationId: string, formData: OrganisationFormDataMock) => {
    cy.intercept('PUT', `${MOCK_API_HOST}/organisations/${organisationId}`, {
      statusCode: 200,
      body: {
        organisation: {
          id: organisationId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDisabled: false,
          ...formData,
        },
      },
    }).as('updateOrganisation')
  },
)

Cypress.Commands.add('mockDisableOrganisation', (organisationId: string) => {
  cy.intercept('PUT', `${MOCK_API_HOST}/organisations/${organisationId}/disable`, {
    statusCode: 200,
    body: {
      organisation: {
        id: organisationId,
        isDisabled: true,
        name: 'Disabled Organisation',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
  }).as('disableOrganisation')
})

Cypress.Commands.add('mockPaymentModeList', () => {
  cy.intercept('GET', `${MOCK_API_HOST}/payment-modes`, {
    statusCode: 200,
    body: {
      paymentModes,
    },
  }).as('getPaymentModeList')
})

Cypress.Commands.add('mockDonorRefList', () => {
  cy.intercept('GET', `${MOCK_API_HOST}/donors/refs`, {
    statusCode: 200,
    body: {
      donorRefs: donors,
    },
  }).as('getDonorRefList')
})

Cypress.Commands.add('mockDonor', (index: number) => {
  const donor = donors[index]
  cy.intercept('GET', `${MOCK_API_HOST}/donors/*`, {
    statusCode: 200,
    body: {
      donor,
    },
  }).as('getDonor')
})

Cypress.Commands.add('mockDonationAssetTypeList', () => {
  cy.intercept('GET', `${MOCK_API_HOST}/donation-asset-types`, {
    statusCode: 200,
    body: {
      donationAssetTypes,
    },
  }).as('getDonationAssetTypeList')
})

Cypress.Commands.add('mockDonationAssetType', (index: number) => {
  const donationAssetType = donationAssetTypes[index]
  cy.intercept('GET', `${MOCK_API_HOST}/donation-asset-types/*`, {
    statusCode: 200,
    body: {
      donationAssetType,
    },
  }).as('getDonationAssetType')
})

Cypress.Commands.add('mockCreateDonationAssetType', (formData: DonationAssetTypeFormDataMock) => {
  cy.intercept('POST', `${MOCK_API_HOST}/donation-asset-types`, {
    statusCode: 201,
    body: {
      donationAssetType: {
        id: 'new-donation-asset-type-id',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDisabled: false,
        ...formData,
      },
    },
  }).as('createDonationAssetType')
})

Cypress.Commands.add(
  'mockUpdateDonationAssetType',
  (donationAssetTypeId: string, formData: DonationAssetTypeFormDataMock) => {
    cy.intercept('PUT', `${MOCK_API_HOST}/donation-asset-types/${donationAssetTypeId}`, {
      statusCode: 200,
      body: {
        donationAssetType: {
          id: donationAssetTypeId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDisabled: false,
          ...formData,
        },
      },
    }).as('updateDonationAssetType')
  },
)

Cypress.Commands.add('mockDisableDonationAssetType', (donationAssetTypeId: string) => {
  cy.intercept('PUT', `${MOCK_API_HOST}/donation-asset-types/${donationAssetTypeId}/disable`, {
    statusCode: 200,
    body: {
      donationAssetType: {
        id: donationAssetTypeId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        name: 'Disabled Donation Asset Type',
        isDefault: false,
        isDisabled: true,
      },
    },
  }).as('disableDonationAssetType')
})

Cypress.Commands.add('mockDonationMethodList', () => {
  cy.intercept('GET', `${MOCK_API_HOST}/donation-methods`, {
    statusCode: 200,
    body: {
      donationMethods,
    },
  }).as('getDonationMethodList')
})

Cypress.Commands.add('mockDonationMethod', (index: number) => {
  const donationMethod = donationMethods[index]
  cy.intercept('GET', `${MOCK_API_HOST}/donation-methods/*`, {
    statusCode: 200,
    body: {
      donationMethod,
    },
  }).as('getDonationMethod')
})

Cypress.Commands.add('mockCreateDonationMethod', (formData: DonationMethodFormDataMock) => {
  cy.intercept('POST', `${MOCK_API_HOST}/donation-methods`, {
    statusCode: 201,
    body: {
      donationMethod: {
        id: 'new-donation-method-id',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDisabled: false,
        ...formData,
      },
    },
  }).as('createDonationMethod')
})

Cypress.Commands.add(
  'mockUpdateDonationMethod',
  (donationMethodId: string, formData: DonationMethodFormDataMock) => {
    cy.intercept('PUT', `${MOCK_API_HOST}/donation-methods/${donationMethodId}`, {
      statusCode: 200,
      body: {
        donationMethod: {
          id: donationMethodId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDisabled: false,
          ...formData,
        },
      },
    }).as('updateDonationMethod')
  },
)

Cypress.Commands.add('mockDisableDonationMethod', (donationMethodId: string) => {
  cy.intercept('PUT', `${MOCK_API_HOST}/donation-methods/${donationMethodId}/disable`, {
    statusCode: 200,
    body: {
      donationMethod: {
        id: donationMethodId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        name: 'Disabled Donation Method',
        isDefault: false,
        isDisabled: true,
      },
    },
  }).as('disableDonationMethod')
})

Cypress.Commands.add('mockPaymentMode', (index: number) => {
  const paymentMode = paymentModes[index]
  cy.intercept('GET', `${MOCK_API_HOST}/payment-modes/*`, {
    statusCode: 200,
    body: {
      paymentMode,
    },
  }).as('getPaymentMode')
})

Cypress.Commands.add('mockCreatePaymentMode', (formData: PaymentModeFormDataMock) => {
  cy.intercept('POST', `${MOCK_API_HOST}/payment-modes`, {
    statusCode: 201,
    body: {
      paymentMode: {
        id: 'new-payment-mode-id',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDisabled: false,
        ...formData,
      },
    },
  }).as('createPaymentMode')
})

Cypress.Commands.add(
  'mockUpdatePaymentMode',
  (paymentModeId: string, formData: PaymentModeFormDataMock) => {
    cy.intercept('PUT', `${MOCK_API_HOST}/payment-modes/${paymentModeId}`, {
      statusCode: 200,
      body: {
        paymentMode: {
          id: paymentModeId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDisabled: false,
          ...formData,
        },
      },
    }).as('updatePaymentMode')
  },
)

Cypress.Commands.add('mockDisablePaymentMode', (paymentModeId: string) => {
  cy.intercept('PUT', `${MOCK_API_HOST}/payment-modes/${paymentModeId}/disable`, {
    statusCode: 200,
    body: {
      paymentMode: {
        id: paymentModeId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        name: 'Disabled Payment Mode',
        isDisabled: true,
      },
    },
  }).as('disablePaymentMode')
})

Cypress.Commands.add('mockDonationType', (index: number) => {
  const donationType = donationTypes[index]
  cy.intercept('GET', `${MOCK_API_HOST}/donation-types/*`, {
    statusCode: 200,
    body: {
      donationType,
    },
  }).as('getDonationType')
})

Cypress.Commands.add('mockDonationTypeList', () => {
  cy.intercept('GET', `${MOCK_API_HOST}/donation-types`, {
    statusCode: 200,
    body: {
      donationTypes,
    },
  }).as('getDonationTypeList')
})

Cypress.Commands.add('mockCreateDonationType', (formData: DonationTypeFormDataMock) => {
  cy.intercept('POST', `${MOCK_API_HOST}/donation-types`, {
    statusCode: 201,
    body: {
      donationType: {
        id: 'new-donation-type-id',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDisabled: false,
        ...formData,
      },
    },
  }).as('createDonationType')
})

Cypress.Commands.add(
  'mockUpdateDonationType',
  (donationTypeId: string, formData: DonationTypeFormDataMock) => {
    cy.intercept('PUT', `${MOCK_API_HOST}/donation-types/${donationTypeId}`, {
      statusCode: 200,
      body: {
        donationType: {
          id: donationTypeId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDisabled: false,
          ...formData,
        },
      },
    }).as('updateDonationType')
  },
)

Cypress.Commands.add('mockDisableDonationType', (donationTypeId: string) => {
  cy.intercept('PUT', `${MOCK_API_HOST}/donation-types/${donationTypeId}/disable`, {
    statusCode: 200,
    body: {
      donationType: {
        id: donationTypeId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        name: 'Disabled Donation Type',
        organisationId: 'some-org-id',
        isDisabled: true,
      },
    },
  }).as('disableDonationType')
})

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
    const donations = buildMockDonations(
      paymentModes,
      organisations,
      donationTypes,
      donationMethods,
      donationAssetTypes,
      donors,
      pagination.orderBy,
      filter,
    )
    cy.intercept('POST', `${MOCK_API_HOST}/donations/filtered-list`, {
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
  const donation = buildMockDonations(
    paymentModes,
    organisations,
    donationTypes,
    donationMethods,
    donationAssetTypes,
    donors,
  )[index]
  cy.intercept('GET', `${MOCK_API_HOST}/donations/*`, {
    statusCode: 200,
    body: {
      donation,
    },
  }).as('getDonation')
})

Cypress.Commands.add(
  'mockDonorList',
  (pagination?: DonorListPaginationRequest, filter?: DonorListFilterMock) => {
    const donors = buildMockDonors(pagination?.orderBy, filter)

    cy.intercept('POST', `${MOCK_API_HOST}/donors/filtered-list`, {
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

Cypress.Commands.add(
  'mockTaxReceiptList',
  (pagination?: TaxReceiptListPaginationRequest, filter?: TaxReceiptListFilterMock) => {
    if (!pagination) {
      pagination = {
        page: 1,
        pageSize: 10,
        orderBy: { createdAt: 'desc' },
      }
    }
    const taxReceipts = buildMockTaxReceipts(donors, pagination?.orderBy, filter)
    cy.intercept('POST', `${MOCK_API_HOST}/tax-receipts/filtered-list`, {
      statusCode: 200,
      body: {
        taxReceipts: taxReceipts.slice(
          (pagination.page - 1) * pagination.pageSize,
          pagination.page * pagination.pageSize,
        ),
        pagination: {
          ...pagination,
          totalCount: taxReceipts.length,
        },
      },
    }).as('getTaxReceiptList')
  },
)

Cypress.Commands.add('mockCreateDonation', (formData: DonationFormDataMock) => {
  const donation = buildMockDonations(
    paymentModes,
    organisations,
    donationTypes,
    donationMethods,
    donationAssetTypes,
    donors,
  )[0]
  cy.intercept('POST', `${MOCK_API_HOST}/donations`, {
    statusCode: 201,
    body: {
      donation: {
        ...donation,
        ...formData,
      },
    },
  }).as('createDonation')
})

Cypress.Commands.add('mockUpdateDonation', (donationId: string, formData: DonationFormDataMock) => {
  const donation = buildMockDonations(
    paymentModes,
    organisations,
    donationTypes,
    donationMethods,
    donationAssetTypes,
    donors,
  )[0]
  cy.intercept('PUT', `${MOCK_API_HOST}/donations/${donationId}`, {
    statusCode: 200,
    body: {
      donation: {
        ...donation,
        ...formData,
      },
    },
  }).as('updateDonation')
})

Cypress.Commands.add('mockDeleteDonation', () => {
  cy.intercept('DELETE', `${MOCK_API_HOST}/donations/*`, {
    statusCode: 204,
  }).as('deleteDonation')
})

Cypress.Commands.add('mockUploadImage', () => {
  cy.intercept('POST', `${MOCK_API_HOST}/files/upload-image`, {
    statusCode: 201,
    body: buildMockImage(),
  })
})

export {}
