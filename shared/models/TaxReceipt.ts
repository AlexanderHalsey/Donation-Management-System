import type { DonationListItem } from './Donation'
import type { DonorRef } from './Donor'
import type { BoolFilter, DateTimeFilter, SelectFilter } from './Filters'
import type { Pagination, PaginationRequest } from './Pagination'
import type { TaxReceiptListSortOrder } from './SortOrder'

export type TaxReceiptType = 'INDIVIDUAL' | 'ANNUAL'
export type TaxReceiptStatus = 'PENDING' | 'PROCESSING' | 'FAILED' | 'COMPLETED' | 'CANCELED'

export interface TaxReceiptListItem {
  id: string
  createdAt: Date
  updatedAt: Date
  receiptNumber: number
  donor: DonorRef
  type: TaxReceiptType
  file?: {
    id: string
    name: string
  }
  status: TaxReceiptStatus
  canceledAt?: Date
  canceledReason?: string
}

export type TaxReceiptListPaginationRequest = PaginationRequest<TaxReceiptListSortOrder>
export type TaxReceiptListPagination = Pagination<TaxReceiptListSortOrder>

export interface TaxReceiptListFilter {
  donorId?: SelectFilter
  createdAt?: DateTimeFilter
  type?: TaxReceiptTypeFilter
  status?: TaxReceiptStatusFilter
}

export type TaxReceiptTypeFilter = {
  equals?: TaxReceiptType
}

export type TaxReceiptStatusFilter = {
  in?: TaxReceiptStatus[]
}
