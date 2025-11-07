import { Organisation } from '@generated/prisma/client'
import { DonationTypeCreateManyInput } from '@generated/prisma/models/DonationType'

export const buildMockDonationTypeCreateManyInput = ({
  index,
  organisation,
}: {
  index: number
  organisation: Organisation
}): DonationTypeCreateManyInput => ({
  name: `Donation Type ${index} of ${organisation.name}`,
  organisationId: organisation.id,
})
