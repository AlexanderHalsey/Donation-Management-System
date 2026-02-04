import axios from 'axios'
import { parse as parseContentDisposition } from 'content-disposition'
import { saveAs } from 'file-saver'
import { parseISO } from 'date-fns'

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
  convertDtoToEligibleTaxReceiptDonor,
  convertDtoToOrganisation,
  convertDtoToPaymentMode,
  convertDtoToTaxReceiptListItem,
} from './converters'

import type { LoginFormData } from '@/features/auth'
import type { DonationFormData } from '@/features/donations'
import type { DonationAssetTypeFormData } from '@/features/donationAssetTypes'
import type { DonationMethodFormData } from '@/features/donationMethods'
import type { DonationTypeFormData } from '@/features/donationTypes'
import type { OrganisationFormData } from '@/features/organisations'
import type { PaymentModeFormData } from '@/features/paymentModes'
import type { AnnualTaxReceiptsFormData } from '@/features/taxReceipts'

import type {
  BulkAnnualTaxReceiptResponse,
  CancelTaxReceiptRequest,
  FileUploadResponse,
  GetDonationAssetTypeListResponse,
  GetDonationAssetTypeResponse,
  GetDonationListRequest,
  GetDonationListResponse,
  GetDonationMethodListResponse,
  GetDonationMethodResponse,
  GetDonationResponse,
  GetDonationTypeListResponse,
  GetDonationTypeResponse,
  GetDonorListRequest,
  GetDonorListResponse,
  GetDonorRefListResponse,
  GetDonorResponse,
  GetEligibleTaxReceiptDonorsResponse,
  GetEligibleTaxReceiptYearOrganisationsResponse,
  GetOrganisationListResponse,
  GetOrganisationRefListResponse,
  GetOrganisationResponse,
  GetPaymentModeListResponse,
  GetPaymentModeResponse,
  GetTaxReceiptListRequest,
  GetTaxReceiptListResponse,
  GetTaxReceiptResponse,
  LoginResponse,
} from '@shared/dtos'
import type {
  Donation,
  DonationAssetType,
  DonationListFilter,
  DonationListItem,
  DonationListPagination,
  DonationListPaginationRequest,
  DonationListSortOrder,
  DonationMethod,
  DonationType,
  Donor,
  DonorListFilter,
  DonorListItem,
  DonorListPagination,
  DonorListPaginationRequest,
  DonorListSortOrder,
  DonorRef,
  EligibleTaxReceiptDonor,
  Organisation,
  OrganisationRef,
  PaymentMode,
  TaxReceiptListFilter,
  TaxReceiptListItem,
  TaxReceiptListPagination,
  TaxReceiptListPaginationRequest,
} from '@shared/models'

export const login = async (formData: LoginFormData): Promise<LoginResponse> => {
  return await withClient((client) => client.post<LoginResponse>('/auth/login', formData))
}

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
    client.get<GetOrganisationRefListResponse>('/organisations/refs'),
  )
  return response.organisationRefs
}

export const getDonationTypes = async (): Promise<DonationType[]> => {
  const response = await withClient((client) =>
    client.get<GetDonationTypeListResponse>('/donation-types'),
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
    client.get<GetDonationMethodListResponse>('/donation-methods'),
  )
  return response.donationMethods.map(convertDtoToDonationMethod)
}

export const getDonorRefs = async (): Promise<DonorRef[]> => {
  const response = await withClient((client) => client.get<GetDonorRefListResponse>('/donors/refs'))
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

export const getTaxReceipts = async (
  pagination: TaxReceiptListPaginationRequest,
  filter?: TaxReceiptListFilter,
): Promise<{
  taxReceipts: TaxReceiptListItem[]
  pagination: TaxReceiptListPagination
}> => {
  const request: GetTaxReceiptListRequest = {
    pagination,
    filter,
  }
  const response = await withClient((client) =>
    client.post<GetTaxReceiptListResponse>('/tax-receipts/filtered-list', request),
  )
  return {
    taxReceipts: response.taxReceipts.map(convertDtoToTaxReceiptListItem),
    pagination: response.pagination,
  }
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

export const cancelTaxReceipt = async (
  taxReceiptId: string,
  canceledReason: string,
): Promise<void> => {
  const request: CancelTaxReceiptRequest = { canceledReason }
  await withClient((client) => client.put<void>(`/tax-receipts/${taxReceiptId}/cancel`, request))
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

export const getDonationMethod = async (donationMethodId: string): Promise<DonationMethod> => {
  const response = await withClient((client) =>
    client.get<GetDonationMethodResponse>(`donation-methods/${donationMethodId}`),
  )
  return convertDtoToDonationMethod(response.donationMethod)
}

export const postDonationMethod = async (
  formData: DonationMethodFormData,
): Promise<DonationMethod> => {
  const response = await withClient((client) =>
    client.post<GetDonationMethodResponse>('donation-methods', formData),
  )
  return convertDtoToDonationMethod(response.donationMethod)
}

export const putDonationMethod = async (
  donationMethodId: string,
  formData: DonationMethodFormData,
): Promise<DonationMethod> => {
  const response = await withClient((client) =>
    client.put<GetDonationMethodResponse>(`donation-methods/${donationMethodId}`, formData),
  )
  return convertDtoToDonationMethod(response.donationMethod)
}

export const disableDonationMethod = async (donationMethodId: string): Promise<DonationMethod> => {
  const response = await withClient((client) =>
    client.put<GetDonationMethodResponse>(`donation-methods/${donationMethodId}/disable`),
  )
  return convertDtoToDonationMethod(response.donationMethod)
}

export const getPaymentModes = async (): Promise<PaymentMode[]> => {
  const response = await withClient((client) =>
    client.get<GetPaymentModeListResponse>('/payment-modes'),
  )
  return response.paymentModes.map(convertDtoToPaymentMode)
}

export const getPaymentMode = async (paymentModeId: string): Promise<PaymentMode> => {
  const response = await withClient((client) =>
    client.get<GetPaymentModeResponse>(`payment-modes/${paymentModeId}`),
  )
  return convertDtoToPaymentMode(response.paymentMode)
}

export const postPaymentMode = async (formData: PaymentModeFormData): Promise<PaymentMode> => {
  const response = await withClient((client) =>
    client.post<GetPaymentModeResponse>('payment-modes', formData),
  )
  return convertDtoToPaymentMode(response.paymentMode)
}

export const putPaymentMode = async (
  paymentModeId: string,
  formData: PaymentModeFormData,
): Promise<PaymentMode> => {
  const response = await withClient((client) =>
    client.put<GetPaymentModeResponse>(`payment-modes/${paymentModeId}`, formData),
  )
  return convertDtoToPaymentMode(response.paymentMode)
}

export const disablePaymentMode = async (paymentModeId: string): Promise<PaymentMode> => {
  const response = await withClient((client) =>
    client.put<GetPaymentModeResponse>(`payment-modes/${paymentModeId}/disable`),
  )
  return convertDtoToPaymentMode(response.paymentMode)
}

export const getDonationType = async (donationTypeId: string): Promise<DonationType> => {
  const response = await withClient((client) =>
    client.get<GetDonationTypeResponse>(`donation-types/${donationTypeId}`),
  )
  return convertDtoToDonationType(response.donationType)
}

export const postDonationType = async (formData: DonationTypeFormData): Promise<DonationType> => {
  const response = await withClient((client) =>
    client.post<GetDonationTypeResponse>('donation-types', formData),
  )
  return convertDtoToDonationType(response.donationType)
}

export const putDonationType = async (
  donationTypeId: string,
  formData: DonationTypeFormData,
): Promise<DonationType> => {
  const response = await withClient((client) =>
    client.put<GetDonationTypeResponse>(`donation-types/${donationTypeId}`, formData),
  )
  return convertDtoToDonationType(response.donationType)
}

export const disableDonationType = async (donationTypeId: string): Promise<DonationType> => {
  const response = await withClient((client) =>
    client.put<GetDonationTypeResponse>(`donation-types/${donationTypeId}/disable`),
  )
  return convertDtoToDonationType(response.donationType)
}

export const getOrganisations = async (): Promise<Organisation[]> => {
  const response = await withClient((client) =>
    client.get<GetOrganisationListResponse>('/organisations'),
  )
  return response.organisations.map(convertDtoToOrganisation)
}

export const getOrganisation = async (organisationId: string): Promise<Organisation> => {
  const response = await withClient((client) =>
    client.get<GetOrganisationResponse>(`organisations/${organisationId}`),
  )
  return convertDtoToOrganisation(response.organisation)
}

export const postOrganisation = async (formData: OrganisationFormData): Promise<Organisation> => {
  const response = await withClient((client) =>
    client.post<GetOrganisationResponse>('organisations', formData),
  )
  return convertDtoToOrganisation(response.organisation)
}

export const putOrganisation = async (
  organisationId: string,
  formData: OrganisationFormData,
): Promise<Organisation> => {
  const response = await withClient((client) =>
    client.put<GetOrganisationResponse>(`organisations/${organisationId}`, formData),
  )
  return convertDtoToOrganisation(response.organisation)
}

export const disableOrganisation = async (organisationId: string): Promise<Organisation> => {
  const response = await withClient((client) =>
    client.put<GetOrganisationResponse>(`organisations/${organisationId}/disable`),
  )
  return convertDtoToOrganisation(response.organisation)
}

export const uploadImage = async (file: File): Promise<FileUploadResponse> => {
  const formData = new FormData()
  formData.append('file', file)

  return await withClient((client) =>
    client.post<FileUploadResponse>('/files/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  )
}

export const getEligibleTaxReceiptYearOrganisations = async (): Promise<
  Omit<GetEligibleTaxReceiptYearOrganisationsResponse, 'releaseDate'> & { releaseDate: Date }
> => {
  const response = await withClient((client) =>
    client.get<GetEligibleTaxReceiptYearOrganisationsResponse>(
      '/tax-receipts/eligible-year-organisations',
    ),
  )
  return {
    ...response,
    releaseDate: parseISO(response.releaseDate),
  }
}

export const getEligibleTaxReceiptDonors = async (
  year: number,
  organisationId: string,
): Promise<EligibleTaxReceiptDonor[]> => {
  const response = await withClient((client) =>
    client.get<GetEligibleTaxReceiptDonorsResponse>(
      `/tax-receipts/eligible-donors/${year}/${organisationId}`,
    ),
  )
  return response.eligibleDonors.map(convertDtoToEligibleTaxReceiptDonor)
}

export const postIndividualTaxReceipt = async (donationId: string): Promise<string> => {
  const response = await withClient((client) =>
    client.post<GetTaxReceiptResponse>(`/tax-receipts/individual/${donationId}`),
  )
  return response.taxReceiptId
}

export const postAnnualBulkTaxReceipts = async (
  year: number,
  organisationId: string,
  formData: AnnualTaxReceiptsFormData,
): Promise<string[]> => {
  const response = await withClient((client) =>
    client.post<BulkAnnualTaxReceiptResponse>(
      `/tax-receipts/annual/bulk/${year}/${organisationId}`,
      formData,
    ),
  )
  return response.taxReceiptIds
}

export const postRetryFailedTaxReceiptGeneration = async (taxReceiptId: string): Promise<void> => {
  await withClient((client) => client.post<void>(`/tax-receipts/${taxReceiptId}/retry-failed`))
}

export const exportDonationListCsv = async (
  orderBy: DonationListSortOrder,
  filter?: DonationListFilter,
): Promise<void> => {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
  })
  const response = await client.post<string>('/exports/donations/csv', { orderBy, filter })
  const { parameters } = parseContentDisposition(response.headers['content-disposition'])
  saveAs(new Blob([response.data], { type: response.headers['content-type'] }), parameters.filename)
}

export const exportDonationListXlsx = async (
  orderBy: DonationListSortOrder,
  filter?: DonationListFilter,
): Promise<void> => {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    responseType: 'arraybuffer',
  })
  const response = await client.post<ArrayBuffer>('/exports/donations/xlsx', { orderBy, filter })
  const { parameters } = parseContentDisposition(response.headers['content-disposition'])
  saveAs(new Blob([response.data], { type: response.headers['content-type'] }), parameters.filename)
}

export const exportDonorListCsv = async (
  orderBy: DonorListSortOrder,
  filter?: DonorListFilter,
): Promise<void> => {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
  })
  const response = await client.post<string>('/exports/donors/csv', { orderBy, filter })
  const { parameters } = parseContentDisposition(response.headers['content-disposition'])
  saveAs(new Blob([response.data], { type: response.headers['content-type'] }), parameters.filename)
}

export const exportDonorListXlsx = async (
  orderBy: DonorListSortOrder,
  filter?: DonorListFilter,
): Promise<void> => {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    responseType: 'arraybuffer',
  })
  const response = await client.post<ArrayBuffer>('/exports/donors/xlsx', { orderBy, filter })
  const { parameters } = parseContentDisposition(response.headers['content-disposition'])
  saveAs(new Blob([response.data], { type: response.headers['content-type'] }), parameters.filename)
}
