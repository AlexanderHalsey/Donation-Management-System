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
export interface DonorSummaryDto {
  id: string
  createdAt: string
  updatedAt: string
  firstName: string
  lastName: string
}

export interface DonorDto extends DonorSummaryDto {
  email?: string
  phoneNumber?: string
  civility?: string
  streetAddress1?: string
  streetAddress2?: string
  postalCode?: string
  city?: string
  state?: string
  country?: string
  isFacilitator: boolean
  isDisabled: boolean
  donationCount: number
  donationTotalAmount: number
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
  donor: DonorSummaryDto
  taxReceiptId?: string
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
  donor?: DonorSummaryListSortOrder
}

export interface DonorListSortOrder extends DonorSummaryListSortOrder {
  donationCount?: SortOrder
  donationTotalAmount?: SortOrder
  email?: SortOrder
}

export interface PaymentModeListSortOrder extends NameSortOrder {}
export interface OrganisationListSortOrder extends NameSortOrder {}
export interface DonationTypeListSortOrder extends NameSortOrder {}
export interface DonationMethodListSortOrder extends NameSortOrder {}
export interface DonationAssetTypeListSortOrder extends NameSortOrder {}
export interface DonorSummaryListSortOrder {
  lastName?: SortOrder
}

export type SortOrder = 'asc' | 'desc'

interface NameSortOrder {
  name?: SortOrder
}

export interface DonationListFilter {
  donorId?: UuidFilter
  donatedAt?: DateTimeFilter
  amount?: FloatFilter
  paymentModeId?: UuidFilter
  organisationId?: UuidFilter
  donationTypeId?: UuidFilter
  isDisabled?: BoolFilter
}

export interface UuidFilter {
  in?: string[]
}

export interface DateTimeFilter {
  lte?: Date
  gte?: Date
}

export interface FloatFilter {
  equals?: number
  lte?: number
  gte?: number
}

export interface BoolFilter {
  equals?: boolean
}

export interface GetDonationListRequest {
  pagination: DonationListPaginationRequest
  filter?: DonationListFilter
}

export interface GetDonationListResponse {
  donations: DonationDto[]
  pagination: DonationListPagination
}

export interface GetDonationListContextResponse {
  paymentModes: PaymentModeDto[]
  organisations: OrganisationSummaryDto[]
  donationTypes: DonationTypeDto[]
  donors: DonorSummaryDto[]
}

export interface GetDonationResponse {
  donation: DonationDto
}
