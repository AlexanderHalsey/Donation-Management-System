import { parseISO } from 'date-fns'

import { convertDtoToPaymentMode } from './paymentMode'
import { convertDtoToOrganisationSummary } from './organisation'
import { convertDtoToDonationType } from './donationType'
import { convertDtoToDonationMethod } from './donationMethod'
import { convertDtoToDonationAssetType } from './donationAssetType'
import { convertDtoToDonorSummary } from './donor'

import type { DonationDto } from '@shared/dtos'
import type { Donation } from '@shared/models'

export const convertDtoToDonation = (dto: DonationDto): Donation => {
  return {
    ...dto,
    createdAt: parseISO(dto.createdAt),
    updatedAt: parseISO(dto.updatedAt),
    donatedAt: parseISO(dto.donatedAt),
    paymentMode: convertDtoToPaymentMode(dto.paymentMode),
    organisation: convertDtoToOrganisationSummary(dto.organisation),
    donationType: convertDtoToDonationType(dto.donationType),
    donationMethod: convertDtoToDonationMethod(dto.donationMethod),
    donationAssetType: convertDtoToDonationAssetType(dto.donationAssetType),
    donor: convertDtoToDonorSummary(dto.donor),
  }
}
