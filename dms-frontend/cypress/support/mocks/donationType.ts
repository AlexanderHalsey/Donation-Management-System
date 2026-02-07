import { v4 } from 'uuid'

import type { DonationTypeDto, OrganisationDto } from '@shared/dtos'

export type DonationTypeFormDataMock = {
  name: string
  organisationId: string
  isTaxReceiptEnabled: boolean
}

export function buildMockDonationTypes(organisations: OrganisationDto[]): DonationTypeDto[] {
  return Array.from({ length: 10 }).map((_, index) => ({
    id: v4(),
    createdAt: new Date(2024, 0, index + 1).toISOString(),
    updatedAt: new Date(2024, 1, index + 1).toISOString(),
    name: `Donation Type ${index + 1}`,
    isTaxReceiptEnabled: index % 2 === 0,
    organisationId: organisations[index % organisations.length].id,
    isDisabled: false,
  }))
}
