import { useAuthStore } from '@/stores'
import router from '@/router'

import axios, { type AxiosInstance, type AxiosResponse } from 'axios'

export async function withClient<T>(
  body: (client: AxiosInstance) => Promise<AxiosResponse<T>>,
): Promise<T> {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
  })
  client.interceptors.request.use((config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  })

  try {
    const response = await body(client)
    return response.data
  } catch (error) {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      throw error
    }
    // if we get a 401, try to refresh the token and retry the request
    await refreshToken()
    const response = await body(client)
    return response.data
  }
}
async function refreshToken(): Promise<string> {
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
    await router.push({ name: 'Login' })
    throw new Error('Session expired. Please log in again.')
  }
}
