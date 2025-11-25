import { z } from 'zod'
import i18next from 'i18next'
import { zodI18nMap } from 'zod-i18n-map'
import fr from 'zod-i18n-map/locales/fr/zod.json'

i18next.init({
  lng: 'fr',
  resources: {
    fr: { zod: fr },
  },
})
z.setErrorMap(zodI18nMap)
