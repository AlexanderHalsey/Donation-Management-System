import { PaymentModeCreateManyInput } from '../generated/prisma/models'

export const buildMockPaymentModeCreateManyInput = (index: number): PaymentModeCreateManyInput => ({
  name: `Payment Mode ${index + 1}`,
})
