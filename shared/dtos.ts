export interface PaymentModeDto {
  id: string
  createdAt: string
  updatedAt: string
  name: string
}

export interface OrganisationSummaryDto {
  id: string
  createdAt: string
  updatedAt: string
  name: string
}

export interface OrganisationDto extends OrganisationSummaryDto {
  title?: string
  address?: string
  locality?: string
  postCode?: string
  logoUrl?: string
  object?: string
  objectDescription?: string
  signatoryName?: string
  signatoryPosition?: string
  signatureUrl?: string
}

export interface DonationTypeDto {
  id: string
  createdAt: string
  updatedAt: string
  name: string
  organisationId: string
}

export interface DonationMethodDto {
  id: string
  createdAt: string
  updatedAt: string
  name: string
  isDefault: boolean
}

export interface DonationAssetTypeDto {
  id: string
  createdAt: string
  updatedAt: string
  name: string
  isDefault: boolean
}

export interface DonationDto {
  id: string
  createdAt: string
  updatedAt: string
  amount: number
  paymentMode: PaymentModeDto
  organisation: OrganisationSummaryDto
  donationType: DonationTypeDto
  donationMethod: DonationMethodDto
  donationAssetType: DonationAssetTypeDto
  isDisabled: boolean
  contactId: string
  receiptId?: string
}

export interface PaginationRequest {
  page: number
  pageSize: number
}

export interface PaginationDto {
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface DonationPaginationRequest extends PaginationRequest {
  orderBy?: DonationSortOrderRequest
}

export interface DonationSortOrderRequest {
  createdAt?: SortOrder
  amount?: SortOrder
  paymentMode?: PaymentModeSortOrderRequest
  organisation?: OrganisationSortOrderRequest
  donationType?: DonationTypeSortOrderRequest
  donationMethod?: DonationMethodSortOrderRequest
  donationAssetType?: DonationAssetTypeSortOrderRequest
}

export interface PaymentModeSortOrderRequest {
  createdAt?: SortOrder
  name?: SortOrder
}

export interface OrganisationSortOrderRequest {
  createdAt?: SortOrder
  name?: SortOrder
}

export interface DonationTypeSortOrderRequest {
  createdAt?: SortOrder
  name?: SortOrder
}

export interface DonationMethodSortOrderRequest {
  createdAt?: SortOrder
  name?: SortOrder
}

export interface DonationAssetTypeSortOrderRequest {
  createdAt?: SortOrder
  name?: SortOrder
}

export type SortOrder = 'asc' | 'desc'

export interface GetDonationListRequest {
  pagination: DonationPaginationRequest
}

export interface GetDonationListResponse {
  donations: DonationDto[]
  pagination: PaginationDto
}
