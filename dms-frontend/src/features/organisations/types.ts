import type z from 'zod'
import { organisationFormSchema } from './schemas'

export type OrganisationFormData = z.infer<typeof organisationFormSchema>
