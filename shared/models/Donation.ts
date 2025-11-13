import type { DonationAssetType } from './DonationAssetType'
import type { DonationMethod } from './DonationMethod'
import type { DonationType } from './DonationType'
import type { DonorSummary } from './Donor'
import type { BoolFilter, DateTimeFilter, FloatFilter, UuidFilter } from './Filters'
import type { OrganisationSummary } from './Organisation'
import type { Pagination, PaginationRequest } from './Pagination'
import type { PaymentMode } from './PaymentMode'
import type { DonationListSortOrder } from './SortOrder'

export type Donation = {
  id: string
  createdAt: Date
  updatedAt: Date
  donatedAt: Date
  amount: number
  paymentMode: PaymentMode
  organisation: OrganisationSummary
  donationType: DonationType
  donationMethod: DonationMethod
  donationAssetType: DonationAssetType
  isDisabled: boolean
  donor: DonorSummary
  taxReceiptId?: string
}

export type DonationListPaginationRequest = PaginationRequest<DonationListSortOrder>
export type DonationListPagination = Pagination<DonationListSortOrder>

export type DonationListFilter = {
  donorId?: UuidFilter
  donatedAt?: DateTimeFilter
  amount?: FloatFilter
  paymentModeId?: UuidFilter
  organisationId?: UuidFilter
  donationTypeId?: UuidFilter
  isDisabled?: BoolFilter
}
