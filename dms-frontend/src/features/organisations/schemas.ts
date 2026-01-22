import z from 'zod'

export const organisationFormSchema = z.object({
  name: z.string('Obligatoire').min(1, 'Obligatoire').max(255),
  isTaxReceiptEnabled: z.boolean(),
  title: z.string().optional(),
  address: z.string().optional(),
  locality: z.string().optional(),
  postCode: z.string().optional(),
  logoId: z.uuid().optional(),
  object: z.string().max(255).optional(),
  objectDescription: z.string().optional(),
  signatoryName: z.string().max(255).optional(),
  signatoryPosition: z.string().max(255).optional(),
  signatureId: z.uuid().optional(),
})
