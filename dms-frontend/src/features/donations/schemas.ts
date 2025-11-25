import type { DonationType } from '@shared/models'
import { z } from 'zod'

export const getDonationFormSchema = (donationTypeOptions: DonationType[]) => {
  return z
    .object({
      donorId: z.string().uuid(),
      donatedAt: z.date(),
      amount: z.number(),
      organisationId: z.string().uuid(),
      donationTypeId: z.string().uuid(),
      paymentModeId: z.string().uuid(),
      donationMethodId: z.string().uuid(),
      donationAssetTypeId: z.string().uuid(),
    })
    .superRefine((data, ctx) => {
      if (
        data.organisationId !==
        donationTypeOptions.find((dt) => dt.id === data.donationTypeId)?.organisationId
      ) {
        ;['donationTypeId', 'organisationId'].forEach((field) => {
          ctx.addIssue({
            code: 'custom',
            message: "Le type de don sélectionné n'appartient pas à l'organisation choisie.",
            path: [field],
          })
        })
      }
    })
}
