import { v4 } from 'uuid'

import type { DonationType, Organisation } from '@shared/models'

export type DonationTypeFormDataMock = {
  name: string
  organisationId: string
  isTaxReceiptEnabled: boolean
}

export function buildMockDonationTypes(organisations: Organisation[]): DonationType[] {
  return Array.from({ length: 10 }).map((_, index) => ({
    id: v4(),
    createdAt: new Date(2024, 0, index + 1),
    updatedAt: new Date(2024, 1, index + 1),
    name: `Donation Type ${index + 1}`,
    isTaxReceiptEnabled: index % 2 === 0,
    organisationId: organisations[index % organisations.length].id,
    isDisabled: false,
  }))
}
