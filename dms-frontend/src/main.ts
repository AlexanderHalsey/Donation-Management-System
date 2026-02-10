import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'

import { createPinia } from 'pinia'
import { useLocaleStore } from '@/stores'

import { Quasar, Loading, Notify, QSpinnerPie } from 'quasar'

import App from './App.vue'
import router from './router'

import type { Translations } from './locales/i18nTranslation'

import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import './assets/main.scss'

async function main() {
  const app = createApp(App)

  const pinia = createPinia()

  app.use(pinia)

  const locale = navigator.language.split('-')[0] === 'fr' ? 'fr' : 'en'
  const i18n = createI18n({
    legacy: false,
    locale,
    fallbackLocale: 'en',
    messages: {
      fr: (await import('./locales/fr.json')).default satisfies Translations,
      en: (await import('./locales/en.json')).default satisfies Translations,
    },
  })

  app.use(i18n)
  app.use(router)
  app.use(Quasar, {
    plugins: { Loading, Notify },
    config: {
      loading: {
        delay: 0,
        spinnerColor: 'primary',
        spinnerSize: 70,
        spinner: QSpinnerPie,
      },
      notify: {
        position: 'top-right',
        timeout: 4000,
        textColor: 'white',
        actions: [
          {
            icon: 'close',
            color: 'white',
            round: true,
            handler: () => {
              /* ... */
            },
          },
        ],
      },
    },
  })

  const localeStore = useLocaleStore()
  localeStore.setLocale(locale)

  app.mount('#app')
}

void main()
