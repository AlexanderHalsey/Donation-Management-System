import type z from 'zod'
import type { annualTaxReceiptsFormSchema, cancelTaxReceiptSchema } from './schemas'

export type CancelTaxReceiptFormData = z.infer<typeof cancelTaxReceiptSchema> & { id: string }
export type AnnualTaxReceiptsFormData = z.infer<typeof annualTaxReceiptsFormSchema>
