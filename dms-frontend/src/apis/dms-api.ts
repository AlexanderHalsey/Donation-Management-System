import type { RandomColor } from '@/models'
import { withClient } from './client'

export async function getRandomColor(): Promise<RandomColor> {
  return await withClient((client) => client.get<RandomColor>('/random-color'))
}
