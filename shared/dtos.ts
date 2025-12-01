export interface PaymentModeDto {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  isDisabled: boolean
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

export interface DonationTypeDto {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  organisationId: string
  isDisabled: boolean
}

export interface DonationMethodDto {
  id: string
  name: string
  isDisabled: boolean
  createdAt: string
  updatedAt: string
  isDefault: boolean
}

export interface DonationAssetTypeDto {
  id: string
  name: string
  isDisabled: boolean
  createdAt: string
  updatedAt: string
  isDefault: boolean
}

export interface DonorRefDto {
  id: string
  lastName: string
  firstName?: string
  isDisabled: boolean
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
  paymentMode: PaymentModeDto
  organisation: OrganisationRefDto
  donationType: DonationTypeDto
  donor: DonorRefDto
  taxReceiptId?: string
}

export interface DonationDto extends DonationListItemDto {
  createdAt: string
  donationMethod: DonationMethodDto
  donationAssetType: DonationAssetTypeDto
}

export type FileStatusDto = 'active' | 'draft'

export interface FileMetadataDto {
  id: string
  uploadedAt: string
  expiresAt?: string
  storageKey?: string
  name: string
  size: number
  mimeType: string
  hash: string
  status: FileStatusDto
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
  paymentMode?: PaymentModeSortOrder
  organisation?: OrganisationRefSortOrder
  donationType?: DonationTypeSortOrder
  donationMethod?: DonationMethodSortOrder
  donationAssetType?: DonationAssetTypeSortOrder
  donor?: DonorRefSortOrder
}

export interface DonorListSortOrder extends DonorRefSortOrder {
  updatedAt?: SortOrder
  donationCount?: SortOrder
  donationTotalAmount?: SortOrder
  email?: SortOrder
}

export interface PaymentModeSortOrder extends NameSortOrder {}
export interface OrganisationRefSortOrder extends NameSortOrder {}
export interface DonationTypeSortOrder extends NameSortOrder {}
export interface DonationMethodSortOrder extends NameSortOrder {}
export interface DonationAssetTypeSortOrder extends NameSortOrder {}
export interface DonorRefSortOrder {
  lastName?: SortOrder
}

export type SortOrder = 'asc' | 'desc'

interface NameSortOrder {
  name?: SortOrder
}

export interface DonationListFilter {
  donor?: {
    id?: UuidFilter
    isDisabled?: BoolFilter
  }
  donatedAt?: DateTimeFilter
  amount?: FloatFilter
  paymentModeId?: UuidFilter
  organisationId?: UuidFilter
  donationTypeId?: UuidFilter
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

export interface GetDonationAssetTypeListResponse {
  donationAssetTypes: DonationAssetTypeDto[]
}

export interface GetDonationMethodListResponse {
  donationMethods: DonationMethodDto[]
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

export interface GetDonationAssetTypeResponse {
  donationAssetType: DonationAssetTypeDto
}

export interface GetDonationMethodResponse {
  donationMethod: DonationMethodDto
}

export interface GetPaymentModeResponse {
  paymentMode: PaymentModeDto
}

export interface GetDonationTypeResponse {
  donationType: DonationTypeDto
}

export interface DonationRequest {
  donorId: string
  donatedAt: string
  amount: number
  organisationId: string
  donationTypeId: string
  paymentModeId: string
  donationMethodId: string
  donationAssetTypeId: string
}

export interface DonationAssetTypeRequest {
  name: string
  isDefault: boolean
}

export interface DonationMethodRequest {
  name: string
  isDefault: boolean
}

export interface PaymentModeRequest {
  name: string
}

export interface DonationTypeRequest {
  name: string
  organisationId: string
}

export interface FileUploadRequest {
  file: unknown
}

export interface FileUploadResponse {
  fileId: string
}
