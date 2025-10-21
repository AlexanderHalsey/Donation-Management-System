import { z } from 'zod'

export const appSettingsSchema = z.object({
  baseURL: z.string(),
})
