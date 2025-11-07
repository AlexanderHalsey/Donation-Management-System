import { withClient } from './client'

import { convertDtoToDonation } from './converters'

import type { GetDonationListRequest, GetDonationListResponse } from '@shared/dtos'
import type { Donation, DonationSortOrder, Pagination, PaginationRequest } from '@shared/models'

export const getDonations = async (
  pagination?: PaginationRequest<DonationSortOrder>,
): Promise<{
  donations: Donation[]
  pagination: Pagination<DonationSortOrder>
}> => {
  const request: GetDonationListRequest = {
    pagination: {
      page: pagination?.page || 1,
      pageSize: pagination?.pageSize || 10,
      orderBy: pagination?.orderBy ?? { createdAt: 'desc' },
    },
  }
  const response = await withClient((client) =>
    client.post<GetDonationListResponse>('/donations/filtered-list', request),
  )
  return {
    donations: response.donations.map(convertDtoToDonation),
    pagination: response.pagination,
  }
}

export const getDonation = async (donationId: string): Promise<Donation> => {
  // TODO replace with proper API call
  const { donations } = await getDonations({
    page: 1,
    pageSize: 1000,
    orderBy: { createdAt: 'desc' },
  })
  return donations.find((donation) => donation.id === donationId)!
}
