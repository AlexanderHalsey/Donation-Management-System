import { v4 } from 'uuid'

import type { DonationMethodDto } from '@shared/dtos'

export type DonationMethodFormDataMock = {
  name: string
  isDefault: boolean
}

export function buildMockDonationMethods(): DonationMethodDto[] {
  return Array.from({ length: 5 }).map((_, index) => ({
    id: v4(),
    createdAt: new Date(2024, 0, index + 1).toISOString(),
    updatedAt: new Date(2024, 1, index + 1).toISOString(),
    name: `Donation Method ${index + 1}`,
    isDefault: index === 0,
    isDisabled: false,
  }))
}
