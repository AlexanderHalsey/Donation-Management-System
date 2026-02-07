import { v4 } from 'uuid'

import type { PaymentModeDto } from '@shared/dtos'

export type PaymentModeFormDataMock = {
  name: string
}

export function buildMockPaymentModes(): PaymentModeDto[] {
  return Array.from({ length: 4 }).map((_, index) => ({
    id: v4(),
    createdAt: new Date(2024, 0, index + 1).toISOString(),
    updatedAt: new Date(2024, 1, index + 1).toISOString(),
    name: `Payment Mode ${index + 1}`,
    isDisabled: false,
  }))
}
