import z from 'zod'

export const paymentModeFormSchema = z.object({
  name: z.string().min(1, 'Obligatoire').max(255),
})
