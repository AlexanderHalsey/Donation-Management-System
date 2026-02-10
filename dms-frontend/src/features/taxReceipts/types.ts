import type z from 'zod'
import type { cancelTaxReceiptSchema, getAnnualTaxReceiptsFormSchema } from './schemas'

export type CancelTaxReceiptFormData = z.infer<typeof cancelTaxReceiptSchema> & { id: string }
export type AnnualTaxReceiptsFormData = z.infer<ReturnType<typeof getAnnualTaxReceiptsFormSchema>>
