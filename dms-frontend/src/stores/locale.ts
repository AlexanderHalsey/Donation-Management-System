import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

import { z } from 'zod'

import { Quasar } from 'quasar'
import * as quasarFr from 'quasar/lang/fr'
import * as quasarEn from 'quasar/lang/en-GB'

type Lang = 'en' | 'fr'

export const useLocaleStore = defineStore('locale', () => {
  const locale = ref<Lang>()

  const setLocale = (newLocale: Lang) => {
    locale.value = newLocale
  }

  watch(locale, async (newLocale) => {
    if (!newLocale) return

    // Quasar
    Quasar.lang.set(newLocale === 'fr' ? quasarFr.default : quasarEn.default)

    // Zod
    z.config({
      ...(newLocale === 'fr' ? z.locales.fr() : z.locales.en()),
      customError: (iss) => {
        if (iss.code === 'invalid_type' || (iss.origin === 'string' && iss.code === 'too_small')) {
          return newLocale === 'fr' ? 'Obligatoire' : 'Required'
        }
      },
    })
  })

  return { locale, setLocale }
})
