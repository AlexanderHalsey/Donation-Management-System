import { Injectable } from '@nestjs/common'

import { formatISO } from 'date-fns'
import { omit } from 'es-toolkit'

import { DonationTypeDto } from '../dtos'
import { DonationType } from '@shared/models'

@Injectable()
export class DonationTypeConverter {
  constructor() {}

  convertDonationTypeToDto(donationType: DonationType): DonationTypeDto {
    return {
      ...omit(donationType, ['createdAt', 'updatedAt']),
      createdAt: formatISO(donationType.createdAt),
      updatedAt: formatISO(donationType.updatedAt),
    }
  }
}
