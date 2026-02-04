import z from 'zod'

export const loginSchema = z.object({
  username: z.string('Obligatoire').min(1, 'Obligatoire'),
  password: z.string('Obligatoire').min(1, 'Obligatoire'),
})
