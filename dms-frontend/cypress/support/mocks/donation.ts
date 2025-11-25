import { addDays } from 'date-fns'
import { v4 } from 'uuid'
import { sortBy } from 'es-toolkit'
import { get } from 'es-toolkit/compat'

import type {
  Donation,
  DonationAssetType,
  DonationListFilter,
  DonationListSortOrder,
  DonationMethod,
  DonationType,
  DonorRef,
  Organisation,
  PaymentMode,
} from '@shared/models'

export type DonationListFilterMock = Omit<
  DonationListFilter,
  'paymentModeId' | 'organisationId' | 'donationTypeId' | 'donorId'
> & {
  paymentModeId?: { in?: number[] }
  organisationId?: { in?: number[] }
  donationTypeId?: { in?: number[] }
  donorId?: { in?: number[] }
}

export function buildMockDonations(
  paymentModes: PaymentMode[],
  organisations: Organisation[],
  donationTypes: DonationType[],
  donationMethods: DonationMethod[],
  donationAssetTypes: DonationAssetType[],
  donorRefs: DonorRef[],
  orderBy?: DonationListSortOrder,
  filter?: DonationListFilterMock,
): Donation[] {
  const totalCount = 100 as const

  let donations = Array.from({ length: totalCount }).map((_, index) => ({
    id: v4(),
    createdAt: addDays(new Date(2024, 0, 1), index),
    updatedAt: addDays(new Date(2024, 1, 1), index),
    donatedAt: addDays(new Date(2024, 0, 1), index),
    amount: ((index % 10) + 1) * 10,
    paymentMode: paymentModes[index % paymentModes.length],
    organisation: organisations[index % organisations.length],
    donationType: donationTypes[index % donationTypes.length],
    donationMethod: donationMethods[index % donationMethods.length],
    donationAssetType: donationAssetTypes[index % donationAssetTypes.length],
    donor: donorRefs[index % donorRefs.length],
  }))

  donations = donations.filter((donation) => {
    if (
      (typeof filter?.amount?.gte === 'number' && donation.amount < filter.amount.gte) ||
      (typeof filter?.amount?.lte === 'number' && donation.amount > filter.amount.lte) ||
      (filter?.amount?.equals !== undefined && donation.amount !== filter.amount.equals) ||
      (typeof filter?.donatedAt?.gte === 'object' && donation.donatedAt < filter.donatedAt.gte) ||
      (typeof filter?.donatedAt?.lte === 'object' && donation.donatedAt > filter.donatedAt.lte) ||
      (filter?.donor?.isDisabled?.equals !== undefined &&
        donation.donor.isDisabled !== filter.donor.isDisabled.equals) ||
      (filter?.donorId?.in !== undefined &&
        !filter.donorId.in.includes(donorRefs.indexOf(donation.donor))) ||
      (filter?.organisationId?.in !== undefined &&
        !filter.organisationId.in.includes(organisations.indexOf(donation.organisation))) ||
      (filter?.donationTypeId?.in !== undefined &&
        !filter.donationTypeId.in.includes(donationTypes.indexOf(donation.donationType))) ||
      (filter?.paymentModeId?.in !== undefined &&
        !filter.paymentModeId.in.includes(paymentModes.indexOf(donation.paymentMode)))
    ) {
      return false
    }

    return true
  })

  if (!orderBy) return donations

  let order: 'asc' | 'desc' | { name: string } = Object.values(orderBy)[0]
  let key: keyof DonationListSortOrder = Object.keys(orderBy)[0] as keyof DonationListSortOrder
  if (typeof order === 'object') {
    key = (key + '.name') as keyof DonationListSortOrder
    order = order.name as 'asc' | 'desc'
  }
  donations = sortBy(donations, [(item) => get(item, key)])
  if (order === 'desc') donations.reverse()

  return donations
}

export type DonationFormDataMock = {
  donorId: string
  donatedAt: Date
  amount: number
  organisationId: string
  donationTypeId: string
  paymentModeId: string
  donationMethodId: string
  donationAssetTypeId: string
}
