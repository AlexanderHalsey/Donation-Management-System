import { withClient } from './client'

import {
  convertDtoToDonation,
  convertDtoToDonationListItem,
  convertDtoToDonationType,
  convertDtoToPaymentMode,
} from './converters'

import type {
  GetDonationListRequest,
  GetDonationListResponse,
  GetDonationResponse,
  GetDonationTypeListResponse,
  GetDonorRefListResponse,
  GetOrganisationRefListResponse,
  GetPaymentModeListResponse,
} from '@shared/dtos'
import type {
  Donation,
  DonationListFilter,
  DonationListItem,
  DonationListPagination,
  DonationListPaginationRequest,
  DonationType,
  DonorRef,
  OrganisationRef,
  PaymentMode,
} from '@shared/models'

export const getDonations = async (
  pagination: DonationListPaginationRequest,
  filter?: DonationListFilter,
): Promise<{
  donations: DonationListItem[]
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
    donations: response.donations.map(convertDtoToDonationListItem),
    pagination: response.pagination,
  }
}

export const getOrganisationRefs = async (): Promise<OrganisationRef[]> => {
  const response = await withClient((client) =>
    client.get<GetOrganisationRefListResponse>('/refs/organisations'),
  )
  return response.organisationRefs
}

export const getPaymentModes = async (): Promise<PaymentMode[]> => {
  const response = await withClient((client) =>
    client.get<GetPaymentModeListResponse>('/refs/payment-modes'),
  )
  return response.paymentModes.map(convertDtoToPaymentMode)
}

export const getDonationTypes = async (): Promise<DonationType[]> => {
  const response = await withClient((client) =>
    client.get<GetDonationTypeListResponse>('/refs/donation-types'),
  )
  return response.donationTypes.map(convertDtoToDonationType)
}

export const getDonorRefs = async (): Promise<DonorRef[]> => {
  const response = await withClient((client) => client.get<GetDonorRefListResponse>('/refs/donors'))
  return response.donorRefs
}

export const getDonation = async (donationId: string): Promise<Donation> => {
  const response = await withClient((client) =>
    client.get<GetDonationResponse>(`/donations/${donationId}`),
  )
  return convertDtoToDonation(response.donation)
}
