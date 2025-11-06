import type { InjectionKey } from 'vue'
import type { Breadcrumb } from './types'

export const setBreadcrumbsInjectionKey = Symbol() as InjectionKey<
  (breadcrumbs: Breadcrumb[]) => void
>
