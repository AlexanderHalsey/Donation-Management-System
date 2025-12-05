import { Organisation } from '@generated/prisma/client'
import { DonationTypeCreateManyInput } from '@generated/prisma/models/DonationType'

const DONATION_TYPE_NAMES = [
  'Sponsor AA',
  'General Donation',
  'One-time Gift',
  'Monthly Contribution',
  'Annual Fund',
  'In-Kind Donation',
  'Memorial Gift',
  'Sponsor BB',
  'Tribute Gift',
] as const

export const buildMockDonationTypeCreateManyInput = ({
  index,
  organisation,
}: {
  index: number
  organisation: Organisation
}): DonationTypeCreateManyInput => ({
  name: DONATION_TYPE_NAMES[index],
  organisationId: organisation.id,
  isTaxReceiptEnabled: index % 3 === 0,
})
