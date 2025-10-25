import type { Color } from '@shared/models'
import type { GetColorResponse, GetColorsResponse } from '@shared/dtos'
import { withClient } from './client'

export async function getColors(): Promise<Color[]> {
  const response = await withClient((client) => client.get<GetColorsResponse>('/colors'))
  return response.colors
}

export async function postRandomColor(): Promise<Color> {
  const response = await withClient((client) => client.post<GetColorResponse>('/colors'))
  return response.color
}
