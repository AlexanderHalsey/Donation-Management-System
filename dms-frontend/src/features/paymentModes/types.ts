import type z from 'zod'
import { paymentModeFormSchema } from './schemas'

export type PaymentModeFormData = z.infer<typeof paymentModeFormSchema>
