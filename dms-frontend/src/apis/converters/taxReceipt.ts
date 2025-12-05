import { parseISO } from 'date-fns'

import type { TaxReceiptListItemDto } from '@shared/dtos'
import type { TaxReceiptListItem } from '@shared/models'

export const convertDtoToTaxReceiptListItem = (dto: TaxReceiptListItemDto): TaxReceiptListItem => {
  return {
    ...dto,
    createdAt: parseISO(dto.createdAt),
    updatedAt: parseISO(dto.updatedAt),
    canceledAt: dto.canceledAt ? parseISO(dto.canceledAt) : undefined,
  }
}
