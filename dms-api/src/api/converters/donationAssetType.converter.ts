import { Injectable } from '@nestjs/common'

import { formatISO } from 'date-fns'
import { omit } from 'es-toolkit'

import { DonationAssetTypeDto } from '../dtos'
import { DonationAssetType } from '@shared/models'

@Injectable()
export class DonationAssetTypeConverter {
  constructor() {}

  convertDonationAssetTypeToDto(donationAssetType: DonationAssetType): DonationAssetTypeDto {
    return {
      ...omit(donationAssetType, ['createdAt', 'updatedAt']),
      createdAt: formatISO(donationAssetType.createdAt),
      updatedAt: formatISO(donationAssetType.updatedAt),
    }
  }
}
