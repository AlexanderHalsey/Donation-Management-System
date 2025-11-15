/**
 * Generic pagination DTO
 * @template T - The type of the orderBy property
 */
export type PaginationRequest<T> = {
  page: number
  pageSize: number
  orderBy: T
}

/**
 * Generic pagination DTO
 * @template T - The type of the orderBy property
 */
export type Pagination<T> = PaginationRequest<T> & {
  totalCount: number
}
