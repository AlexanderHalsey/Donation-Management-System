import { z } from 'zod'

export const randomColorSchema = z.object({
  color: z.string(),
})
