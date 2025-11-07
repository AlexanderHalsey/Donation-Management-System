import { parseISO } from 'date-fns'

import type { PaymentModeDto } from '@shared/dtos'
import type { PaymentMode } from '@shared/models'

export const convertDtoToPaymentMode = (dto: PaymentModeDto): PaymentMode => {
  return {
    ...dto,
    createdAt: parseISO(dto.createdAt),
    updatedAt: parseISO(dto.updatedAt),
  }
}
