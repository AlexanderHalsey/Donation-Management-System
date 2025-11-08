import { v4 } from 'uuid'

import type { DonationMethod } from '@shared/models'

export function buildMockDonationMethods(): DonationMethod[] {
  return Array.from({ length: 4 }).map((_, index) => ({
    id: v4(),
    createdAt: new Date(2024, 0, index + 1),
    updatedAt: new Date(2024, 1, index + 1),
    name: `Donation Method ${index + 1}`,
    isDefault: index === 0,
  }))
}
