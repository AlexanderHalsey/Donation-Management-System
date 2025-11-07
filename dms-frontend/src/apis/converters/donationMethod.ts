import { parseISO } from 'date-fns'

import type { DonationMethodDto } from '@shared/dtos'
import type { DonationMethod } from '@shared/models'

export const convertDtoToDonationMethod = (dto: DonationMethodDto): DonationMethod => {
  return {
    ...dto,
    createdAt: parseISO(dto.createdAt),
    updatedAt: parseISO(dto.updatedAt),
  }
}
