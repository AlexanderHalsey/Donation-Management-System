import { addDays } from 'date-fns'
import { DonationCreateManyInput } from '../generated/prisma/models'

export const buildMockDonationCreateManyInput = ({
  index,
  donationAssetTypeId,
  donationMethodId,
  donationTypeId,
  organisationId,
  paymentModeId,
  donorId,
}: {
  index: number
  donationAssetTypeId: string
  donationMethodId: string
  donationTypeId: string
  organisationId: string
  paymentModeId: string
  donorId: string
}): DonationCreateManyInput => {
  return {
    amount: ((index % 10) + 1) * 10,
    donatedAt: addDays(new Date(2025, 0, 1), index),
    donationAssetTypeId,
    donationMethodId,
    donationTypeId,
    organisationId,
    paymentModeId,
    isDisabled: index % 25 === 24,
    donorId,
  }
}
