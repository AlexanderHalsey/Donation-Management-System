import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { logout as apiLogout } from '@/apis/dms-api'

import * as jwtDecode from 'jwt-decode'

import type { UserRole } from '@shared/models'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)

  const userRole = computed<UserRole | null>(
    () => jwtDecode.jwtDecode<{ role: UserRole }>(accessToken.value ?? '').role ?? null,
  )

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
    logout,
    setToken,
    token: accessToken,
    userRole,
  }
})
