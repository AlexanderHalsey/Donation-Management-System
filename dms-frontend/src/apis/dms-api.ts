import { withClient } from './client'

import {
  convertDonationFormDataToRequest,
  convertDtoToDonation,
  convertDtoToDonationAssetType,
  convertDtoToDonationListItem,
  convertDtoToDonationMethod,
  convertDtoToDonationType,
  convertDtoToDonor,
  convertDtoToDonorListItem,
  convertDtoToPaymentMode,
} from './converters'

import type { DonationFormData } from '@/features/donations'
import type { DonationAssetTypeFormData } from '@/features/donationAssetTypes'

import type {
  GetDonationAssetTypeListResponse,
  GetDonationAssetTypeResponse,
  GetDonationListRequest,
  GetDonationListResponse,
  GetDonationMethodListResponse,
  GetDonationResponse,
  GetDonationTypeListResponse,
  GetDonorListRequest,
  GetDonorListResponse,
  GetDonorRefListResponse,
  GetDonorResponse,
  GetOrganisationRefListResponse,
  GetPaymentModeListResponse,
} from '@shared/dtos'
import type {
  Donation,
  DonationAssetType,
  DonationListFilter,
  DonationListItem,
  DonationListPagination,
  DonationListPaginationRequest,
  DonationMethod,
  DonationType,
  Donor,
  DonorListFilter,
  DonorListItem,
  DonorListPagination,
  DonorListPaginationRequest,
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

export const getDonationAssetTypes = async (): Promise<DonationAssetType[]> => {
  const response = await withClient((client) =>
    client.get<GetDonationAssetTypeListResponse>('/donation-asset-types'),
  )
  return response.donationAssetTypes.map(convertDtoToDonationAssetType)
}

export const getDonationMethods = async (): Promise<DonationMethod[]> => {
  const response = await withClient((client) =>
    client.get<GetDonationMethodListResponse>('/refs/donation-methods'),
  )
  return response.donationMethods.map(convertDtoToDonationMethod)
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

export const getDonors = async (
  pagination: DonorListPaginationRequest,
  filter?: DonorListFilter,
): Promise<{
  donors: DonorListItem[]
  pagination: DonorListPagination
}> => {
  const request: GetDonorListRequest = {
    pagination,
    filter,
  }
  const response = await withClient((client) =>
    client.post<GetDonorListResponse>('/donors/filtered-list', request),
  )
  return {
    donors: response.donors.map(convertDtoToDonorListItem),
    pagination: response.pagination,
  }
}

export const getDonor = async (donorId: string): Promise<Donor> => {
  const response = await withClient((client) => client.get<GetDonorResponse>(`/donors/${donorId}`))
  return convertDtoToDonor(response.donor)
}

export const postDonation = async (formData: DonationFormData): Promise<Donation> => {
  const request = convertDonationFormDataToRequest(formData)
  const response = await withClient((client) =>
    client.post<GetDonationResponse>('/donations', request),
  )
  return convertDtoToDonation(response.donation)
}

export const putDonation = async (
  donationId: string,
  formData: DonationFormData,
): Promise<Donation> => {
  const request = convertDonationFormDataToRequest(formData)
  const response = await withClient((client) =>
    client.put<GetDonationResponse>(`/donations/${donationId}`, request),
  )
  return convertDtoToDonation(response.donation)
}

export const deleteDonation = async (donationId: string): Promise<void> => {
  await withClient((client) => client.delete<void>(`/donations/${donationId}`))
}

export const getDonationAssetType = async (
  donationAssetTypeId: string,
): Promise<DonationAssetType> => {
  const response = await withClient((client) =>
    client.get<GetDonationAssetTypeResponse>(`donation-asset-types/${donationAssetTypeId}`),
  )
  return convertDtoToDonationAssetType(response.donationAssetType)
}

export const postDonationAssetType = async (
  formData: DonationAssetTypeFormData,
): Promise<DonationAssetType> => {
  const response = await withClient((client) =>
    client.post<GetDonationAssetTypeResponse>('donation-asset-types', formData),
  )
  return convertDtoToDonationAssetType(response.donationAssetType)
}

export const putDonationAssetType = async (
  donationAssetTypeId: string,
  formData: DonationAssetTypeFormData,
): Promise<DonationAssetType> => {
  const response = await withClient((client) =>
    client.put<GetDonationAssetTypeResponse>(
      `donation-asset-types/${donationAssetTypeId}`,
      formData,
    ),
  )
  return convertDtoToDonationAssetType(response.donationAssetType)
}

export const disableDonationAssetType = async (
  donationAssetTypeId: string,
): Promise<DonationAssetType> => {
  const response = await withClient((client) =>
    client.put<GetDonationAssetTypeResponse>(`donation-asset-types/${donationAssetTypeId}/disable`),
  )
  return convertDtoToDonationAssetType(response.donationAssetType)
}
