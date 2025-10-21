import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

import { isEqual } from 'es-toolkit'

import { appSettingsSchema } from '@/apis/schemas'
import { type AppSettings } from '@/models'

export const useAppSettingsStore = defineStore(
  'app-settings',
  () => {
    const _appSettings = ref<AppSettings>(EMPTY_APP_SETTINGS)

    const appSettings = computed(() => _appSettings.value)

    const loadAppSettings = async () => {
      if (isEqual(_appSettings.value, EMPTY_APP_SETTINGS)) {
        _appSettings.value = appSettingsSchema.parse(
          (await axios.get<AppSettings>('/appsettings.json')).data,
        )
      }
    }

    return {
      appSettings,
      loadAppSettings,
    }
  },
  { persist: true },
)

export const EMPTY_APP_SETTINGS: AppSettings = {
  baseURL: '',
}
