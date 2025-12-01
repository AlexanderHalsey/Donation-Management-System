import type z from 'zod'
import { donationTypeFormSchema } from './schemas'

export type DonationTypeFormData = z.infer<typeof donationTypeFormSchema>
