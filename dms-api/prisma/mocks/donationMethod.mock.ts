import { DonationMethodCreateManyInput } from '../generated/prisma/models'

const DONATION_METHOD_NAMES = [
  'Manual Entry',
  'Authentic deed',
  'Private agreement',
  'Other',
] as const

export const buildMockDonationMethodCreateManyInput = (
  index: number,
): DonationMethodCreateManyInput => ({
  name: DONATION_METHOD_NAMES[index],
  isDefault: index === 0,
})
