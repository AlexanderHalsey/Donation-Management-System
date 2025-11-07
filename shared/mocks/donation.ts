import { addDays } from 'date-fns'
import { v4 } from 'uuid'
import { sortBy } from 'es-toolkit'

import { buildMockPaymentModes } from './paymentMode'
import { buildMockOrganisations } from './organisation'
import { buildMockDonationTypes } from './donationType'
import { buildMockDonationMethods } from './donationMethod'
import { buildMockDonationAssetTypes } from './donationAssetType'

import type { Donation, DonationSortOrder, PaginationRequest } from '../models'

export function buildMockDonations(pagination?: PaginationRequest<DonationSortOrder>): Donation[] {
  const paymentModes = buildMockPaymentModes()
  const organisations = buildMockOrganisations()
  const donationTypes = buildMockDonationTypes(organisations)
  const donationMethods = buildMockDonationMethods()
  const donationAssetTypes = buildMockDonationAssetTypes()

  const totalCount = 100 as const

  let donations = Array.from({ length: 100 }).map((_, index) => ({
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
    isDisabled: false,
    contactId: v4(),
  }))

  if (!pagination) return donations

  if (pagination.orderBy) {
    let order: 'asc' | 'desc' | { name: string } = Object.values(pagination.orderBy!)[0]
    let key: keyof DonationSortOrder = Object.keys(
      pagination.orderBy!,
    )[0] as keyof DonationSortOrder
    if (typeof order === 'object') {
      key = (key + '.name') as keyof DonationSortOrder
      order = order.name as 'asc' | 'desc'
    }
    donations = sortBy(donations, [key])
    if (order === 'desc') donations.reverse()
  }

  return donations.slice(
    (pagination.page - 1) * pagination.pageSize,
    pagination.page * pagination.pageSize,
  )
}
