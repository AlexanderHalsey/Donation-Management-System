import type z from 'zod'
import type { cancelTaxReceiptSchema } from './schemas'

export type CancelTaxReceiptFormData = z.infer<typeof cancelTaxReceiptSchema> & { id: string }
