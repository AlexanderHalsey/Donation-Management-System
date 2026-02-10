import type { DonationType } from '@shared/models'
import { z } from 'zod'

export const getDonationFormSchema = (
  donationTypeOptions: DonationType[],
  donationTypeNotInOrganisationLabel: string,
) => {
  return z
    .object({
      donorId: z.uuid(),
      donatedAt: z.date(),
      amount: z.number().gt(0),
      organisationId: z.uuid(),
      donationTypeId: z.uuid(),
      paymentModeId: z.uuid(),
      donationMethodId: z.uuid(),
      donationAssetTypeId: z.uuid(),
    })
    .superRefine((data, ctx) => {
      if (
        data.organisationId !==
        donationTypeOptions.find((dt) => dt.id === data.donationTypeId)?.organisationId
      ) {
        ;['donationTypeId', 'organisationId'].forEach((field) => {
          ctx.addIssue({
            code: 'custom',
            message: donationTypeNotInOrganisationLabel,
            path: [field],
          })
        })
      }
    })
}
