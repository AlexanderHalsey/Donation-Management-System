import { Injectable } from '@nestjs/common'

import { formatISO } from 'date-fns'
import { omit } from 'es-toolkit'

import { DonationAssetTypeConverter } from './donationAssetType.converter'
import { DonationMethodConverter } from './donationMethod.converter'
import { DonationTypeConverter } from './donationType.converter'
import { PaymentModeConverter } from './paymentMode.converter'

import { DonationDto, DonationListItemDto } from '../dtos'
import { Donation, DonationListItem } from '@shared/models'
@Injectable()
export class DonationConverter {
  constructor(
    private readonly donationAssetTypeConverter: DonationAssetTypeConverter,
    private readonly donationMethodConverter: DonationMethodConverter,
    private readonly donationTypeConverter: DonationTypeConverter,
    private readonly paymentModeConverter: PaymentModeConverter,
  ) {}

  convertDonationListItemToDto(donation: DonationListItem): DonationListItemDto {
    return {
      ...omit(donation, ['updatedAt', 'donatedAt', 'donationType']),
      updatedAt: formatISO(donation.updatedAt),
      donatedAt: formatISO(donation.donatedAt),
      donationType: this.donationTypeConverter.convertDonationTypeToDto(donation.donationType),
      paymentMode: this.paymentModeConverter.convertPaymentModeToDto(donation.paymentMode),
    }
  }

  convertDonationToDto(donation: Donation): DonationDto {
    return {
      ...omit(donation, ['updatedAt', 'createdAt', 'donatedAt', 'donationType']),
      updatedAt: formatISO(donation.updatedAt),
      createdAt: formatISO(donation.createdAt),
      donatedAt: formatISO(donation.donatedAt),
      donationType: this.donationTypeConverter.convertDonationTypeToDto(donation.donationType),
      paymentMode: this.paymentModeConverter.convertPaymentModeToDto(donation.paymentMode),
      donationMethod: this.donationMethodConverter.convertDonationMethodToDto(
        donation.donationMethod,
      ),
      donationAssetType: this.donationAssetTypeConverter.convertDonationAssetTypeToDto(
        donation.donationAssetType,
      ),
    }
  }
}
