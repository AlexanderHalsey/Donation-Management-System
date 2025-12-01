import { Injectable } from '@nestjs/common'

import { formatISO } from 'date-fns'
import { omit } from 'es-toolkit'

import type { PaymentModeDto } from '@shared/dtos'
import type { PaymentMode } from '@shared/models'

@Injectable()
export class PaymentModeConverter {
  constructor() {}

  convertPaymentModeToDto(paymentMode: PaymentMode): PaymentModeDto {
    return {
      ...omit(paymentMode, ['createdAt', 'updatedAt']),
      createdAt: formatISO(paymentMode.createdAt),
      updatedAt: formatISO(paymentMode.updatedAt),
    }
  }
}
