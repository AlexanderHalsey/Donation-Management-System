import type { randomColorSchema } from '@/apis/schemas'
import type z from 'zod'

export type RandomColor = z.infer<typeof randomColorSchema>
