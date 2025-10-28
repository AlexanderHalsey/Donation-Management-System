import { DonationCreateManyInput } from '../generated/prisma/models'

export const buildMockDonationCreateManyInput = ({
  index,
  donationAssetTypeId,
  donationMethodId,
  donationTypeId,
  organisationId,
  paymentModeId,
}: {
  index: number
  donationAssetTypeId: string
  donationMethodId: string
  donationTypeId: string
  organisationId: string
  paymentModeId: string
}): DonationCreateManyInput => {
  return {
    amount: ((index % 10) + 1) * 10,
    donationAssetTypeId,
    donationMethodId,
    donationTypeId,
    organisationId,
    paymentModeId,
    contactId: '757fd8bc-417b-4815-be6f-d6a52bd50fe9',
  }
}
