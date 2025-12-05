import z from 'zod'

export const cancelTaxReceiptSchema = z.object({
  canceledReason: z.string().min(1, 'Obligatoire').max(500, 'Maximum 500 caractères'),
})
