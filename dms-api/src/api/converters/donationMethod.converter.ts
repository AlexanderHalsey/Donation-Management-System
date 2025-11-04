import { Injectable } from '@nestjs/common'

import { formatISO } from 'date-fns'
import { omit } from 'es-toolkit'

import { DonationMethodDto } from '../dtos'
import { DonationMethod } from '@shared/models'

@Injectable()
export class DonationMethodConverter {
  constructor() {}

  convertDonationMethodToDto(donationMethod: DonationMethod): DonationMethodDto {
    return {
      ...omit(donationMethod, ['createdAt', 'updatedAt']),
      createdAt: formatISO(donationMethod.createdAt),
      updatedAt: formatISO(donationMethod.updatedAt),
    }
  }
}
