import { parseISO } from 'date-fns'
import { omit } from 'es-toolkit'

import type { DonationDto, DonationListItemDto, DonationRequest } from '@shared/dtos'
import type { Donation, DonationListItem } from '@shared/models'
import type { DonationFormData } from '@/features/donations'

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

export const convertDonationFormDataToRequest = (formData: DonationFormData): DonationRequest => {
  return {
    ...omit(formData, ['donatedAt']),
    donatedAt: formData.donatedAt.toISOString(),
  }
}
