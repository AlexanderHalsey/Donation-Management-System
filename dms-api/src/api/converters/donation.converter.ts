import { Injectable } from '@nestjs/common'

import { formatISO } from 'date-fns'
import { omit } from 'es-toolkit'

import { DonationDto, DonationListItemDto } from '../dtos'
import { Donation, DonationListItem } from '@shared/models'
@Injectable()
export class DonationConverter {
  constructor() {}

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
      donationMethod: donation.donationMethod,
      donationAssetType: donation.donationAssetType,
    }
  }
}
