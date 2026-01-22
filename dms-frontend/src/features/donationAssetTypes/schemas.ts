import z from 'zod'

export const donationAssetTypeFormSchema = z.object({
  name: z.string('Obligatoire').min(1, 'Obligatoire').max(255),
  isDefault: z.boolean(),
})
