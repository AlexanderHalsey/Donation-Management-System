import type z from 'zod'
import { donationAssetTypeFormSchema } from './schemas'

export type DonationAssetTypeFormData = z.infer<typeof donationAssetTypeFormSchema>
