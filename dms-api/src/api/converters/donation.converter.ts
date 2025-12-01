import { Injectable } from '@nestjs/common'

import { formatISO } from 'date-fns'
import { omit } from 'es-toolkit'

import { DonationAssetTypeConverter } from './donationAssetType.converter'
import { DonationMethodConverter } from './donationMethod.converter'

import { DonationDto, DonationListItemDto } from '../dtos'
import { Donation, DonationListItem } from '@shared/models'
@Injectable()
export class DonationConverter {
  constructor(
    private readonly donationAssetTypeConverter: DonationAssetTypeConverter,
    private readonly donationMethodConverter: DonationMethodConverter,
  ) {}

  convertDonationListItemToDto(donation: DonationListItem): DonationListItemDto {
    return {
      ...omit(donation, ['updatedAt', 'donatedAt']),
      updatedAt: formatISO(donation.updatedAt),
      donatedAt: formatISO(donation.donatedAt),
    }
  }

  convertDonationToDto(donation: Donation): DonationDto {
    return {
      ...omit(donation, ['updatedAt', 'createdAt', 'donatedAt']),
      updatedAt: formatISO(donation.updatedAt),
      createdAt: formatISO(donation.createdAt),
      donatedAt: formatISO(donation.donatedAt),
      donationMethod: this.donationMethodConverter.convertDonationMethodToDto(
        donation.donationMethod,
      ),
      donationAssetType: this.donationAssetTypeConverter.convertDonationAssetTypeToDto(
        donation.donationAssetType,
      ),
    }
  }
}
