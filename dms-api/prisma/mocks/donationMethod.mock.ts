import { DonationMethodCreateManyInput } from '../generated/prisma/models'

export const buildMockDonationMethodCreateManyInput = (
  index: number,
): DonationMethodCreateManyInput => ({
  name: `Donation Method ${index + 1}`,
  isDefault: index === 0,
})
