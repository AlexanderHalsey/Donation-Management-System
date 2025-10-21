import type { appSettingsSchema } from '@/apis/schemas'
import type z from 'zod'

export type AppSettings = z.infer<typeof appSettingsSchema>
