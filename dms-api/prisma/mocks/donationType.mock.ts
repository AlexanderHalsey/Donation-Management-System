import { DonationTypeCreateManyInput } from '../generated/prisma/models'

export const buildMockDonationTypeCreateManyInput = ({
  index,
  organisationId,
}: {
  index: number
  organisationId: string
}): DonationTypeCreateManyInput => ({
  name: `Donation Type ${index} of Organisation ${organisationId}`,
  organisationId,
})
