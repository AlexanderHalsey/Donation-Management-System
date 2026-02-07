import { v4 } from 'uuid'

import type { DonationAssetTypeDto } from '@shared/dtos'

export function buildMockDonationAssetTypes(): DonationAssetTypeDto[] {
  return Array.from({ length: 4 }).map((_, index) => ({
    id: v4(),
    createdAt: new Date(2024, 0, index + 1).toISOString(),
    updatedAt: new Date(2024, 1, index + 1).toISOString(),
    name: `Donation Asset Type ${index + 1}`,
    isDefault: index === 0,
    isDisabled: false,
  }))
}

export type DonationAssetTypeFormDataMock = {
  name: string
  isDefault: boolean
}
