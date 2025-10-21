import { useAppSettingsStore } from '@/stores'
import axios, { type AxiosInstance, type AxiosResponse } from 'axios'

export async function withClient<T>(
  body: (client: AxiosInstance) => Promise<AxiosResponse<T>>,
): Promise<T> {
  const appSettingsStore = useAppSettingsStore()
  const client = axios.create({
    baseURL: appSettingsStore.appSettings.baseURL,
  })
  const response = await body(client)
  return response.data
}
