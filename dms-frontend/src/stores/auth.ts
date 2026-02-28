import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { logout as apiLogout } from '@/apis/dms-api'

import * as jwtDecode from 'jwt-decode'

import type { UserRole } from '@shared/models'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const isAuthEnabled = import.meta.env.VITE_AUTH_ENABLED === 'true'

  const userRole = computed<UserRole | null>(() => {
    return isAuthEnabled && accessToken.value
      ? jwtDecode.jwtDecode<{ role: UserRole }>(accessToken.value).role
      : null
  })

  const hasFullVisualAccess = computed(() => userRole.value === 'admin' || !isAuthEnabled)

  function setToken(newToken: string) {
    accessToken.value = newToken
  }

  function clearToken() {
    accessToken.value = null
  }

  const logout = async () => {
    await apiLogout()
    clearToken()
  }

  return {
    clearToken,
    hasFullVisualAccess,
    isAuthEnabled,
    logout,
    setToken,
    token: accessToken,
    userRole,
  }
})
