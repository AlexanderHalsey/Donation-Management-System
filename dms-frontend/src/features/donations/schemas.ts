import type { DonationType } from '@shared/models'
import { z } from 'zod'

export const getDonationFormSchema = (donationTypeOptions: DonationType[]) => {
  return z
    .object({
      donorId: z.uuid('Obligatoire'),
      donatedAt: z.date('Obligatoire'),
      amount: z.number('Obligatoire').gt(0),
      organisationId: z.uuid('Obligatoire'),
      donationTypeId: z.uuid('Obligatoire'),
      paymentModeId: z.uuid('Obligatoire'),
      donationMethodId: z.uuid('Obligatoire'),
      donationAssetTypeId: z.uuid('Obligatoire'),
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
