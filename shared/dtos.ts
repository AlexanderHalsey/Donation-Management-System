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
export interface DonationSortOrder {
  createdAt?: SortOrder
  donatedAt?: SortOrder
  amount?: SortOrder
  paymentMode?: PaymentModeSortOrder
  organisation?: OrganisationSortOrder
  donationType?: DonationTypeSortOrder
  donationMethod?: DonationMethodSortOrder
  donationAssetType?: DonationAssetTypeSortOrder
}

export interface PaymentModeSortOrder extends NameSortOrder {}
export interface OrganisationSortOrder extends NameSortOrder {}
export interface DonationTypeSortOrder extends NameSortOrder {}
export interface DonationMethodSortOrder extends NameSortOrder {}
export interface DonationAssetTypeSortOrder extends NameSortOrder {}

export type SortOrder = 'asc' | 'desc'

interface NameSortOrder {
  name?: SortOrder
}

export interface GetDonationListRequest {
  pagination: PaginationRequest<DonationSortOrder>
}

export interface GetDonationListResponse {
  donations: DonationDto[]
  pagination: PaginationDto<DonationSortOrder>
}
