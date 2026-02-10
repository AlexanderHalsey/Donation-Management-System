import z from 'zod'

export const donationAssetTypeFormSchema = z.object({
  name: z.string().min(1).max(255),
  isDefault: z.boolean(),
})
