import type { DonorRef } from './Donor'
import type { BoolFilter, DateTimeFilter, UuidFilter } from './Filters'
import type { Pagination, PaginationRequest } from './Pagination'
import type { TaxReceiptListSortOrder } from './SortOrder'

export type TaxReceiptType = 'individual' | 'annual'

export interface TaxReceiptListItem {
  id: string
  createdAt: Date
  updatedAt: Date
  receiptNumber: number
  donor: DonorRef
  type: TaxReceiptType
  file: {
    id: string
    name: string
  }
  isCanceled: boolean
  canceledAt?: Date
  canceledReason?: string
}

export type TaxReceiptListPaginationRequest = PaginationRequest<TaxReceiptListSortOrder>
export type TaxReceiptListPagination = Pagination<TaxReceiptListSortOrder>

export interface TaxReceiptListFilter {
  donorId?: UuidFilter
  createdAt?: DateTimeFilter
  type?: TaxReceiptTypeFilter
  isCanceled?: BoolFilter
}

export type TaxReceiptTypeFilter = {
  equals?: TaxReceiptType
}
