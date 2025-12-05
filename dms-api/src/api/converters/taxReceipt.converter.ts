import { Injectable } from '@nestjs/common'

import { formatISO } from 'date-fns'
import { omit } from 'es-toolkit'

import type { TaxReceiptListItemDto } from '@shared/dtos'
import type { TaxReceiptListItem } from '@shared/models'

@Injectable()
export class TaxReceiptConverter {
  constructor() {}

  convertTaxReceiptListItemToDto(taxReceipt: TaxReceiptListItem): TaxReceiptListItemDto {
    return {
      ...omit(taxReceipt, ['createdAt', 'updatedAt']),
      createdAt: formatISO(taxReceipt.createdAt),
      updatedAt: formatISO(taxReceipt.updatedAt),
      canceledAt: taxReceipt.canceledAt ? formatISO(taxReceipt.canceledAt) : undefined,
    }
  }
}
