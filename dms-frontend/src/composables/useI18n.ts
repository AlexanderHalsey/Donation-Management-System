// eslint-disable-next-line no-restricted-imports
import { useI18n as useOriginalI18n } from 'vue-i18n'

import type { Translations } from '@/locales/i18nTranslation'
import type { DotNestedKeys } from '@/types'

export type TranslationKey = DotNestedKeys<Translations>

export function useI18n() {
  const { t, ...rest } = useOriginalI18n()

  const typedT = (key: TranslationKey, ...args: unknown[]) => {
    // @ts-expect-error key is strictly typed, but the original t expects a generic string
    return t(key, ...args)
  }

  return {
    ...rest,
    t: typedT,
  }
}
