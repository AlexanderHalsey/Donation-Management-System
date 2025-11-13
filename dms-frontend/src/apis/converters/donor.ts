import { parseISO } from 'date-fns'

import type { DonorDto, DonorSummaryDto } from '@shared/dtos'
import type { Donor, DonorSummary } from '@shared/models'

export const convertDtoToDonorSummary = (dto: DonorSummaryDto): DonorSummary => {
  return {
    ...dto,
    createdAt: parseISO(dto.createdAt),
    updatedAt: parseISO(dto.updatedAt),
  }
}

export const convertDtoToDonor = (dto: DonorDto): Donor => {
  return {
    ...dto,
    createdAt: parseISO(dto.createdAt),
    updatedAt: parseISO(dto.updatedAt),
  }
}
