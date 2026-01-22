import z from 'zod'

export const donationTypeFormSchema = z.object({
  name: z.string('Obligatoire').min(1, 'Obligatoire').max(255),
  organisationId: z.uuid('Obligatoire'),
  isTaxReceiptEnabled: z.boolean(),
})
