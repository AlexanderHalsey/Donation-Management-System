import type { DonationAssetType } from './DonationAssetType'
import type { DonationMethod } from './DonationMethod'
import type { DonationType } from './DonationType'
import type { DonorRef } from './Donor'
import type { BoolFilter, DateTimeFilter, FloatFilter, SelectFilter } from './Filters'
import type { OrganisationRef } from './Organisation'
import type { Pagination, PaginationRequest } from './Pagination'
import type { PaymentMode } from './PaymentMode'
import type { DonationListSortOrder } from './SortOrder'

export interface DonationRef {
  id: string
  donatedAt: Date
  amount: number
  donor: DonorRef
}

export interface DonationListItem extends DonationRef {
  updatedAt: Date
  paymentMode: PaymentMode
  organisation: OrganisationRef
  donationType: DonationType
  isTaxReceiptEnabled: boolean
  taxReceiptId?: string
}

export interface Donation extends DonationListItem {
  createdAt: Date
  donationMethod: DonationMethod
  donationAssetType: DonationAssetType
}

export interface DonationExport {
  lastName: string
  firstName?: string
  email?: string
  externalId: number
  donatedAt: Date
  amount: number
  paymentMode: string
  donationType: string
  organisation: string
  donationMethod?: string
  donationAssetType?: string
  taxReceiptNumber?: number
  taxReceiptType?: string
  taxReceiptStatus?: string
}

export type DonationListPaginationRequest = PaginationRequest<DonationListSortOrder>
export type DonationListPagination = Pagination<DonationListSortOrder>

export interface DonationListFilter {
  donor?: {
    id?: SelectFilter
    isDisabled?: BoolFilter
  }
  donatedAt?: DateTimeFilter
  amount?: FloatFilter
  paymentModeId?: SelectFilter
  organisationId?: SelectFilter
  donationTypeId?: SelectFilter
}
