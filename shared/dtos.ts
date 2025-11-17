export interface PaymentModeRefDto {
  id: string
  name: string
}

export interface PaymentModeDto extends PaymentModeRefDto {
  createdAt: string
  updatedAt: string
}

export interface OrganisationRefDto {
  id: string
  name: string
}

export interface OrganisationDto extends OrganisationRefDto {
  createdAt: string
  updatedAt: string
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

export interface DonationTypeRefDto {
  id: string
  name: string
}

export interface DonationTypeDto extends DonationTypeRefDto {
  createdAt: string
  updatedAt: string
  organisationId: string
}

export interface DonationMethodRefDto {
  id: string
  name: string
}

export interface DonationMethodDto extends DonationMethodRefDto {
  createdAt: string
  updatedAt: string
  isDefault: boolean
}

export interface DonationAssetTypeRefDto {
  id: string
  name: string
}

export interface DonationAssetTypeDto extends DonationAssetTypeRefDto {
  createdAt: string
  updatedAt: string
  isDefault: boolean
}

export interface DonorRefDto {
  id: string
  lastName: string
  firstName?: string
}
export interface DonorListItemDto extends DonorRefDto {
  updatedAt: string
  externalId: number
  donationCount: number
  donationTotalAmount: number
  email?: string
}

export interface DonorDto extends DonorListItemDto {
  createdAt: string
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
}

export interface DonationListItemDto {
  id: string
  updatedAt: string
  donatedAt: string
  amount: number
  paymentMode: PaymentModeRefDto
  organisation: OrganisationRefDto
  donationType: DonationTypeRefDto
  isDisabled: boolean
  donor: DonorRefDto
  taxReceiptId?: string
}

export interface DonationDto extends DonationListItemDto {
  createdAt: string
  donationMethod: DonationMethodRefDto
  donationAssetType: DonationAssetTypeRefDto
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

export interface DonorListPaginationRequest extends PaginationRequest<DonorListSortOrder> {}
export interface DonorListPagination extends PaginationDto<DonorListSortOrder> {}

export interface DonationListSortOrder {
  updatedAt?: SortOrder
  donatedAt?: SortOrder
  amount?: SortOrder
  paymentMode?: PaymentModeRefSortOrder
  organisation?: OrganisationRefSortOrder
  donationType?: DonationTypeRefSortOrder
  donationMethod?: DonationMethodRefSortOrder
  donationAssetType?: DonationAssetTypeRefSortOrder
  donor?: DonorRefSortOrder
}

export interface DonorListSortOrder extends DonorRefSortOrder {
  updatedAt?: SortOrder
  donationCount?: SortOrder
  donationTotalAmount?: SortOrder
  email?: SortOrder
}

export interface PaymentModeRefSortOrder extends NameSortOrder {}
export interface OrganisationRefSortOrder extends NameSortOrder {}
export interface DonationTypeRefSortOrder extends NameSortOrder {}
export interface DonationMethodRefSortOrder extends NameSortOrder {}
export interface DonationAssetTypeRefSortOrder extends NameSortOrder {}
export interface DonorRefSortOrder {
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

export interface DonorListFilter {
  id?: UuidFilter
  donatedAt?: DateTimeFilter
  totalAmount?: FloatFilter
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
  donations: DonationListItemDto[]
  pagination: DonationListPagination
}

export interface GetDonorListRequest {
  pagination: DonorListPaginationRequest
  filter?: DonorListFilter
}

export interface GetDonorListResponse {
  donors: DonorListItemDto[]
  pagination: DonorListPagination
}

export interface GetOrganisationRefListResponse {
  organisationRefs: OrganisationRefDto[]
}

export interface GetPaymentModeListResponse {
  paymentModes: PaymentModeDto[]
}

export interface GetDonationTypeListResponse {
  donationTypes: DonationTypeDto[]
}

export interface GetDonorRefListResponse {
  donorRefs: DonorRefDto[]
}

export interface GetDonationResponse {
  donation: DonationDto
}

export interface GetDonorResponse {
  donor: DonorDto
}
