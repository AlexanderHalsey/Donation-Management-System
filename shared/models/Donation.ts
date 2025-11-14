import type { DonationAssetTypeRef } from './DonationAssetType'
import type { DonationMethodRef } from './DonationMethod'
import type { DonationTypeRef } from './DonationType'
import type { DonorRef } from './Donor'
import type { BoolFilter, DateTimeFilter, FloatFilter, UuidFilter } from './Filters'
import type { OrganisationRef } from './Organisation'
import type { Pagination, PaginationRequest } from './Pagination'
import type { PaymentModeRef } from './PaymentMode'
import type { DonationListSortOrder } from './SortOrder'

export interface DonationListItem {
  id: string
  updatedAt: Date
  donatedAt: Date
  amount: number
  paymentMode: PaymentModeRef
  organisation: OrganisationRef
  donationType: DonationTypeRef
  isDisabled: boolean
  donor: DonorRef
  taxReceiptId?: string
}

export interface Donation extends DonationListItem {
  createdAt: Date
  donationMethod: DonationMethodRef
  donationAssetType: DonationAssetTypeRef
}

export type DonationListPaginationRequest = PaginationRequest<DonationListSortOrder>
export type DonationListPagination = Pagination<DonationListSortOrder>

export interface DonationListFilter {
  donorId?: UuidFilter
  donatedAt?: DateTimeFilter
  amount?: FloatFilter
  paymentModeId?: UuidFilter
  organisationId?: UuidFilter
  donationTypeId?: UuidFilter
  isDisabled?: BoolFilter
}
