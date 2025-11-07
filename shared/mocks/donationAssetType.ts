import { v4 } from 'uuid'

import type { DonationAssetType } from '../models'

export function buildMockDonationAssetTypes(): DonationAssetType[] {
  return Array.from({ length: 4 }).map((_, index) => ({
    id: v4(),
    createdAt: new Date(2024, 0, index + 1),
    updatedAt: new Date(2024, 1, index + 1),
    name: `Donation Asset Type ${index + 1}`,
    isDefault: index === 0,
  }))
}
