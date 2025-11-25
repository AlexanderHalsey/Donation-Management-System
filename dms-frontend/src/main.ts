import { createApp } from 'vue'

import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import { Quasar, Loading, Notify, QSpinnerPie } from 'quasar'

import App from './App.vue'
import router from './router'

import './zodi18n.ts'

import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import './assets/main.scss'

async function main() {
  const app = createApp(App)

  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)

  app.use(pinia)
  app.use(router)
  app.use(Quasar, {
    plugins: { Loading, Notify },
    config: {
      loading: {
        delay: 0,
        message: 'Chargement...',
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

  app.mount('#app')
}

void main()
