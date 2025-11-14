import { parseISO } from 'date-fns'

import type { DonationDto, DonationListItemDto } from '@shared/dtos'
import type { Donation, DonationListItem } from '@shared/models'

export const convertDtoToDonationListItem = (dto: DonationListItemDto): DonationListItem => {
  return {
    ...dto,
    updatedAt: parseISO(dto.updatedAt),
    donatedAt: parseISO(dto.donatedAt),
  }
}

export const convertDtoToDonation = (dto: DonationDto): Donation => {
  return {
    ...dto,
    createdAt: parseISO(dto.createdAt),
    updatedAt: parseISO(dto.updatedAt),
    donatedAt: parseISO(dto.donatedAt),
  }
}
