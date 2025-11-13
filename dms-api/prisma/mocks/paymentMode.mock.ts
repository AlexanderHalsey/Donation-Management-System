import { PaymentModeCreateManyInput } from '../generated/prisma/models'

const PAYMENT_MODE_NAMES = [
  'Credit Card',
  'Bank Transfer',
  'Cash',
  'Cheque',
  'Mobile Payment',
  'Direct Debit',
] as const

export const buildMockPaymentModeCreateManyInput = (index: number): PaymentModeCreateManyInput => ({
  name: PAYMENT_MODE_NAMES[index],
})
