import { DonationAssetTypeCreateManyInput } from '../generated/prisma/models'

export const buildMockDonationAssetTypeCreateManyInput = (
  index: number,
): DonationAssetTypeCreateManyInput => ({
  name: `Donation Asset Type ${index + 1}`,
  isDefault: index === 0,
})
