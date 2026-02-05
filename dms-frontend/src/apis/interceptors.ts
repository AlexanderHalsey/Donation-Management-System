import axios, { type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores'

export const authRequestInterceptor = (
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
}

export const refreshToken = async (): Promise<string | null> => {
  const authStore = useAuthStore()
  try {
    const {
      data: { accessToken },
    } = await axios.post<{ accessToken: string }>(
      `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true },
    )
    authStore.setToken(accessToken)
    return accessToken
  } catch (_err) {
    authStore.clearToken()
    return null
  }
}
