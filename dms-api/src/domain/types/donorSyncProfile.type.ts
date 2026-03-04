import z from 'zod'
import { ProfileSchema } from '../schemas'

export type DonorSyncProfile = z.infer<typeof ProfileSchema> & {
  isDisabled?: boolean
}
