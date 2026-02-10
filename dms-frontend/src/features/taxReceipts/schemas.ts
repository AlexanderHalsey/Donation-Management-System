import z from 'zod'

export const cancelTaxReceiptSchema = z.object({
  canceledReason: z.string().min(1).max(500),
})

export const getAnnualTaxReceiptsFormSchema = (atLeastOneDonorLabelError: string) => {
  return z.object({
    donorIds: z.array(z.string()).min(1, atLeastOneDonorLabelError),
  })
}
