import { v4 } from 'uuid'

import type { Donor, DonorListFilter, DonorListSortOrder } from '@shared/models'
import { sortBy } from 'es-toolkit'
import { get } from 'es-toolkit/compat'

export type DonorListFilterMock = Omit<DonorListFilter, 'id'> & {
  id?: { in?: number[] }
}

export function buildMockDonors(
  orderBy?: DonorListSortOrder,
  filter?: DonorListFilterMock,
): Donor[] {
  let donors = Array.from({ length: 30 }).map((_, index) => ({
    id: v4(),
    createdAt: new Date(2024, 0, index + 1),
    updatedAt: new Date(2024, 1, index + 1),
    externalId: index + 1,
    firstName: index % 50 !== 49 ? `FirstName${index + 1}` : undefined,
    lastName: `LastName${index + 1}`,
    email: index % 30 !== 29 ? `donor${index + 1}@example.com` : undefined,
    phoneNumber: index % 3 !== 2 ? `0684567890${index + 1}` : undefined,
    civility: index % 2 === 0 ? 'Mr' : 'Ms',
    streetAddress1: index % 4 !== 3 ? `123 Main St Apt ${index + 1}` : undefined,
    streetAddress2: index % 4 !== 3 ? `Suite ${index + 1}` : undefined,
    postalCode: index % 4 !== 3 ? `1234${index + 1}` : undefined,
    city: index % 4 !== 3 ? `City ${index + 1}` : undefined,
    state: index % 4 !== 3 ? `State ${index + 1}` : undefined,
    country: index % 4 !== 3 ? `Country ${index + 1}` : undefined,
    isFacilitator: index % 50 === 49,
    isDisabled: index % 20 === 19,
    donationCount: (index % 13) + 1,
    donationTotalAmount: ((index % 13) + 1) * 50,
  }))

  donors = donors.filter((donor) => {
    if (
      (typeof filter?.totalAmount?.gte === 'number' &&
        donor.donationTotalAmount < filter.totalAmount.gte) ||
      (typeof filter?.totalAmount?.lte === 'number' &&
        donor.donationTotalAmount > filter.totalAmount.lte) ||
      (filter?.id?.in !== undefined && !filter.id.in.includes(donors.indexOf(donor)))
    ) {
      return false
    }

    return true
  })

  if (!orderBy) return donors

  const [key, order]: [keyof DonorListSortOrder, 'asc' | 'desc'] = Object.entries(orderBy)[0] as [
    keyof DonorListSortOrder,
    'asc' | 'desc',
  ]
  donors = sortBy(donors, [(item) => get(item, key)])
  if (order === 'desc') donors.reverse()

  return donors
}
