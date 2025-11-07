import { parseISO } from 'date-fns'

import type { DonationTypeDto } from '@shared/dtos'
import type { DonationType } from '@shared/models'

export const convertDtoToDonationType = (dto: DonationTypeDto): DonationType => {
  return {
    ...dto,
    createdAt: parseISO(dto.createdAt),
    updatedAt: parseISO(dto.updatedAt),
  }
}
