import z from 'zod'

export const donationMethodFormSchema = z.object({
  name: z.string().min(1, 'Obligatoire').max(255),
  isDefault: z.boolean().default(false),
})
