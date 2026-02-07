import { parseISO } from 'date-fns'
import { omit } from 'es-toolkit'

import { convertDtoToDonationAssetType } from './donationAssetType'
import { convertDtoToDonationMethod } from './donationMethod'
import { convertDtoToDonationType } from './donationType'
import { convertDtoToPaymentMode } from './paymentMode'

import type { DonationFormData } from '@/features/donations'
import type {
  DonationDto,
  DonationListItemDto,
  DonationRefDto,
  DonationRequest,
} from '@shared/dtos'
import type { Donation, DonationListItem, DonationRef } from '@shared/models'

export const convertDtoToDonationRef = (dto: DonationRefDto): DonationRef => {
  return {
    ...dto,
    donatedAt: parseISO(dto.donatedAt),
  }
}

export const convertDtoToDonationListItem = (dto: DonationListItemDto): DonationListItem => {
  return {
    ...dto,
    updatedAt: parseISO(dto.updatedAt),
    donatedAt: parseISO(dto.donatedAt),
    donationType: convertDtoToDonationType(dto.donationType),
    paymentMode: convertDtoToPaymentMode(dto.paymentMode),
  }
}

export const convertDtoToDonation = (dto: DonationDto): Donation => {
  return {
    ...dto,
    createdAt: parseISO(dto.createdAt),
    updatedAt: parseISO(dto.updatedAt),
    donatedAt: parseISO(dto.donatedAt),
    donationType: convertDtoToDonationType(dto.donationType),
    paymentMode: convertDtoToPaymentMode(dto.paymentMode),
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
