import z from 'zod'

export const donationTypeFormSchema = z.object({
  name: z.string().min(1).max(255),
  organisationId: z.uuid(),
  isTaxReceiptEnabled: z.boolean(),
})
