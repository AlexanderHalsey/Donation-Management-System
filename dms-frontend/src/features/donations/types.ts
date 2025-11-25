import type z from 'zod'
import type { getDonationFormSchema } from './schemas'

export type DonationFormData = z.infer<ReturnType<typeof getDonationFormSchema>>
