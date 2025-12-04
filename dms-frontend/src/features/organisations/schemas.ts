import z from 'zod'

export const organisationFormSchema = z.object({
  name: z.string().min(1, 'Obligatoire').max(255),
  title: z.string().optional(),
  address: z.string().optional(),
  locality: z.string().optional(),
  postCode: z.string().optional(),
  logoId: z.string().uuid().optional(),
  object: z.string().max(255).optional(),
  objectDescription: z.string().optional(),
  signatoryName: z.string().max(255).optional(),
  signatoryPosition: z.string().max(255).optional(),
  signatureId: z.string().uuid().optional(),
})
