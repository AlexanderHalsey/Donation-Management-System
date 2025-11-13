import { withClient } from './client'

import {
  convertDtoToDonation,
  convertDtoToDonationType,
  convertDtoToDonorSummary,
  convertDtoToOrganisationSummary,
  convertDtoToPaymentMode,
} from './converters'

import type {
  GetDonationListContextResponse,
  GetDonationListRequest,
  GetDonationListResponse,
  GetDonationResponse,
} from '@shared/dtos'
import type {
  Donation,
  DonationListFilter,
  DonationListPagination,
  DonationListPaginationRequest,
  DonationType,
  DonorSummary,
  OrganisationSummary,
  PaymentMode,
} from '@shared/models'

export const getDonations = async (
  pagination: DonationListPaginationRequest,
  filter?: DonationListFilter,
): Promise<{
  donations: Donation[]
  pagination: DonationListPagination
}> => {
  const request: GetDonationListRequest = {
    pagination,
    filter,
  }
  const response = await withClient((client) =>
    client.post<GetDonationListResponse>('/donations/filtered-list', request),
  )
  return {
    donations: response.donations.map(convertDtoToDonation),
    pagination: response.pagination,
  }
}

export const getDonationsContext = async (): Promise<{
  paymentModes: PaymentMode[]
  organisations: OrganisationSummary[]
  donationTypes: DonationType[]
  donors: DonorSummary[]
}> => {
  const response = await withClient((client) =>
    client.get<GetDonationListContextResponse>('/donations/context'),
  )
  return {
    paymentModes: response.paymentModes.map(convertDtoToPaymentMode),
    organisations: response.organisations.map(convertDtoToOrganisationSummary),
    donationTypes: response.donationTypes.map(convertDtoToDonationType),
    donors: response.donors.map(convertDtoToDonorSummary),
  }
}

export const getDonation = async (donationId: string): Promise<Donation> => {
  const response = await withClient((client) =>
    client.get<GetDonationResponse>(`/donations/${donationId}`),
  )
  return convertDtoToDonation(response.donation)
}
