import z from 'zod'

export const donationTypeFormSchema = z.object({
  name: z.string().min(1, 'Obligatoire').max(255),
  organisationId: z.string().uuid(),
})
