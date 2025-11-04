export type PaginationRequest<T> = {
  page: number
  pageSize: number
  orderBy?: Record<keyof T, 'asc' | 'desc'>
}

export type Pagination = {
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}
