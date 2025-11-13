import { DonationAssetTypeCreateManyInput } from '../generated/prisma/models'

const DONATION_ASSET_TYPE_NAMES = ['Numerical', 'Company shares', 'Other'] as const

export const buildMockDonationAssetTypeCreateManyInput = (
  index: number,
): DonationAssetTypeCreateManyInput => ({
  name: DONATION_ASSET_TYPE_NAMES[index],
  isDefault: index === 0,
})
