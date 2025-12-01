import type z from 'zod'
import { donationMethodFormSchema } from './schemas'

export type DonationMethodFormData = z.infer<typeof donationMethodFormSchema>
