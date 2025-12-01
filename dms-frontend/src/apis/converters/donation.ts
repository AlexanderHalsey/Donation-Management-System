import { parseISO } from 'date-fns'
import { omit } from 'es-toolkit'

import { convertDtoToDonationAssetType } from './donationAssetType'
import { convertDtoToDonationMethod } from './donationMethod'

import type { DonationFormData } from '@/features/donations'
import type { DonationDto, DonationListItemDto, DonationRequest } from '@shared/dtos'
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
    donationMethod: convertDtoToDonationMethod(dto.donationMethod),
    donationAssetType: convertDtoToDonationAssetType(dto.donationAssetType),
  }
}

export const convertDonationFormDataToRequest = (formData: DonationFormData): DonationRequest => {
  return {
    ...omit(formData, ['donatedAt']),
    donatedAt: formData.donatedAt.toISOString(),
  }
}
