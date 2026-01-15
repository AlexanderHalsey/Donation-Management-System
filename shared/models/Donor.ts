import type { DateTimeFilter, FloatFilter, SelectFilter } from './Filters'
import type { Pagination, PaginationRequest } from './Pagination'
import type { DonorListSortOrder } from './SortOrder'

export interface DonorRef {
  id: string
  firstName?: string
  lastName: string
  isDisabled: boolean
}

export interface DonorRefSelect {
  id: string
  name: string
  isDisabled: boolean
}

export interface DonorListItem extends DonorRef {
  updatedAt: Date
  externalId: number
  donationCount: number
  donationTotalAmount: number
  email?: string
}

export interface Donor extends DonorListItem {
  createdAt: Date
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

export interface DonorExport {
  lastName: string
  firstName?: string
  email?: string
  donationCount: number
  donationTotalAmount: number
}

export type DonorListPaginationRequest = PaginationRequest<DonorListSortOrder>
export type DonorListPagination = Pagination<DonorListSortOrder>

export interface DonorListFilter {
  id?: SelectFilter
  donatedAt?: DateTimeFilter
  totalAmount?: FloatFilter
}
