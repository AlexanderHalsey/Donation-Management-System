export type Breadcrumb = {
  id: string
  label: string
  to?: string
  icon?: string
}

export type MenuItem = {
  label: string
  icon: string
  to: string
}

export type Tag = {
  backgroundColor: string
  color: string
}

export type LazySelectOptions<T> = {
  options: T[]
  filterFn: (_: unknown, update: () => void) => Promise<void>
}
