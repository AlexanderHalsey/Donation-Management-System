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
  donatedAt: string
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

/**
 * Generic pagination DTO
 * @template T - The type of the orderBy property
 */
export interface PaginationRequest<T> {
  page: number
  pageSize: number
  orderBy?: T
}

/**
 * Generic pagination DTO
 * @template T - The type of the orderBy property
 */
export interface PaginationDto<T> extends PaginationRequest<T> {
  totalCount: number
}

export interface DonationListPaginationRequest extends PaginationRequest<DonationListSortOrder> {}
export interface DonationListPagination extends PaginationDto<DonationListSortOrder> {}

export interface DonationListSortOrder {
  createdAt?: SortOrder
  donatedAt?: SortOrder
  amount?: SortOrder
  paymentMode?: PaymentModeListSortOrder
  organisation?: OrganisationListSortOrder
  donationType?: DonationTypeListSortOrder
  donationMethod?: DonationMethodListSortOrder
  donationAssetType?: DonationAssetTypeListSortOrder
}

export interface PaymentModeListSortOrder extends NameSortOrder {}
export interface OrganisationListSortOrder extends NameSortOrder {}
export interface DonationTypeListSortOrder extends NameSortOrder {}
export interface DonationMethodListSortOrder extends NameSortOrder {}
export interface DonationAssetTypeListSortOrder extends NameSortOrder {}

export type SortOrder = 'asc' | 'desc'

interface NameSortOrder {
  name?: SortOrder
}

export interface GetDonationListRequest {
  pagination: DonationListPaginationRequest
  filter?: DonationListFilterRequest
}

export interface GetDonationListResponse {
  donations: DonationDto[]
  pagination: DonationListPagination
}
