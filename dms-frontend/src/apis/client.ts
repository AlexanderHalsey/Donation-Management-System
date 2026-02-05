import router from '@/router'

import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { authRequestInterceptor, refreshToken } from './interceptors'

export async function withClient<T>(
  body: (client: AxiosInstance) => Promise<AxiosResponse<T>>,
): Promise<T> {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
  })

  client.interceptors.request.use(authRequestInterceptor)

  try {
    const response = await body(client)
    return response.data
  } catch (error) {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      throw error
    }
    // if we get a 401, try to refresh the token and retry the request
    if (!(await refreshToken())) {
      await router.push({ name: 'login' })
      throw new Error('Session expired. Please log in again.')
    }
    const response = await body(client)
    return response.data
  }
}
