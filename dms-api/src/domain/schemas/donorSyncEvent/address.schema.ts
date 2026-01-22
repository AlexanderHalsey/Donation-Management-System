import { z } from 'zod'

export const AddressSchema = z
  .object({
    careOf: z.string().optional(),
    streetAddress: z.string().optional(),
    streetAddress2: z.string().optional(),
    zipCode: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    country: z
      .object({
        name: z.string().optional(),
      })
      .optional(),
  })
  .transform((data) => ({
    careOf: data.careOf || undefined,
    streetAddress: data.streetAddress || undefined,
    streetAddress2: data.streetAddress2 || undefined,
    zipCode: data.zipCode || undefined,
    city: data.city || undefined,
    province: data.province || undefined,
    country: data.country?.name || undefined,
  }))
