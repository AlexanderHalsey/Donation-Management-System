import { parseISO } from 'date-fns'

import type { DonorDto, DonorListItemDto } from '@shared/dtos'
import type { Donor, DonorListItem } from '@shared/models'

export const convertDtoToDonorListItem = (dto: DonorListItemDto): DonorListItem => {
  return {
    ...dto,
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
