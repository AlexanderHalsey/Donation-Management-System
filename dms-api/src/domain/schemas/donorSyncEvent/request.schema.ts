import { z } from 'zod'
import { MergedProfileSchema, ProfileSchema } from './profile.schema'

export const DonorSyncEventNotificationSchema = z.discriminatedUnion('action', [
  z
    .object({
      action: z.union([
        z.literal('profile.create'),
        z.literal('profile.update'),
        z.literal('profile.delete'),
      ]),
      payload: ProfileSchema,
    })
    .transform((data) => ({
      action: ['profile.create', 'profile.update'].includes(data.action)
        ? ('UPSERT' as const)
        : ('DELETE' as const),
      payload: data.payload,
    })),
  z
    .object({
      action: z.literal('profile.merge'),
      payload: MergedProfileSchema,
    })
    .transform(
      (data) =>
        ({ action: 'MERGE', payload: data.payload }) as {
          action: 'MERGE'
          payload: typeof data.payload
        },
    ),
])

export const DonorSyncEventRequestSchema = z.object({
  id: z.string(),
  attempt: z.number(),
  notifications: z.array(DonorSyncEventNotificationSchema),
})
