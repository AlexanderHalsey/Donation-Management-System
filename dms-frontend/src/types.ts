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
  load: () => Promise<void>
}

// Advanced type to generate dot-notation keys from a nested object
export type DotNestedKeys<T> = (
  T extends object
    ? {
        [K in keyof T]-?: K extends string
          ? `${K}` | `${K}.${DotNestedKeys<T[K]>}`
          : never
      }[keyof T]
    : ''
) extends infer D
  ? Extract<D, string>
  : never
