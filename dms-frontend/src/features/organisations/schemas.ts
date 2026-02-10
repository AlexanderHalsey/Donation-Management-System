import z from 'zod'

export const organisationFormSchema = z.object({
  name: z.string().min(1).max(255),
  isTaxReceiptEnabled: z.boolean(),
  title: z.string().optional(),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  logoId: z.uuid().optional(),
  object: z.string().max(255).optional(),
  objectDescription: z.string().optional(),
  signatoryName: z.string().max(255).optional(),
  signatoryPosition: z.string().max(255).optional(),
  signatureId: z.uuid().optional(),
})
