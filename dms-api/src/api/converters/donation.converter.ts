import { Injectable } from '@nestjs/common'

import { formatISO } from 'date-fns'
import { omit } from 'es-toolkit'

import { DonationAssetTypeConverter } from './donationAssetType.converter'
import { DonationMethodConverter } from './donationMethod.converter'
import { DonationTypeConverter } from './donationType.converter'
import { DonorConverter } from './donor.converter'
import { OrganisationConverter } from './organisation.converter'
import { PaymentModeConverter } from './paymentMode.converter'

import { DonationDto } from '../dtos'
import { Donation } from '@shared/models'
@Injectable()
export class DonationConverter {
  constructor(
    private readonly donationAssetTypeConverter: DonationAssetTypeConverter,
    private readonly donationMethodConverter: DonationMethodConverter,
    private readonly donationTypeConverter: DonationTypeConverter,
    private readonly donorConverter: DonorConverter,
    private readonly organisationConverter: OrganisationConverter,
    private readonly paymentModeConverter: PaymentModeConverter,
  ) {}

  convertDonationToDto(donation: Donation): DonationDto {
    return {
      ...omit(donation, [
        'createdAt',
        'updatedAt',
        'donatedAt',
        'donationAssetType',
        'donationMethod',
        'donationType',
        'organisation',
        'paymentMode',
        'donor',
      ]),
      createdAt: formatISO(donation.createdAt),
      updatedAt: formatISO(donation.updatedAt),
      donatedAt: formatISO(donation.donatedAt),
      donationAssetType: this.donationAssetTypeConverter.convertDonationAssetTypeToDto(
        donation.donationAssetType,
      ),
      donationMethod: this.donationMethodConverter.convertDonationMethodToDto(
        donation.donationMethod,
      ),
      donationType: this.donationTypeConverter.convertDonationTypeToDto(donation.donationType),
      organisation: this.organisationConverter.convertOrganisationSummaryToDto(
        donation.organisation,
      ),
      paymentMode: this.paymentModeConverter.convertPaymentModeToDto(donation.paymentMode),
      donor: this.donorConverter.convertDonorSummaryToDto(donation.donor),
    }
  }
}
