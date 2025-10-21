import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import { useAppSettingsStore } from '@/stores'

import App from './App.vue'
import router from './router'

async function main() {
  const app = createApp(App)

  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)

  const appSettingsStore = useAppSettingsStore(pinia)
  await appSettingsStore.loadAppSettings()

  app.use(pinia)
  app.use(router)

  app.mount('#app')
}

void main()
