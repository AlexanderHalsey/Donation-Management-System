import axios, { type AxiosInstance, type AxiosResponse } from 'axios'

export async function withClient<T>(
  body: (client: AxiosInstance) => Promise<AxiosResponse<T>>,
): Promise<T> {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
  })
  const response = await body(client)
  return response.data
}
