import { Injectable } from '@nestjs/common'

import { formatISO } from 'date-fns'
import { omit } from 'es-toolkit'

import { DonorDto, DonorSummaryDto } from '../dtos'
import { Donor, DonorSummary } from '@shared/models'

@Injectable()
export class DonorConverter {
  constructor() {}

  convertDonorSummaryToDto(donorSummary: DonorSummary): DonorSummaryDto {
    return {
      ...omit(donorSummary, ['createdAt', 'updatedAt']),
      createdAt: formatISO(donorSummary.createdAt),
      updatedAt: formatISO(donorSummary.updatedAt),
    }
  }

  convertDonorToDto(donor: Donor): DonorDto {
    return {
      ...omit(donor, ['createdAt', 'updatedAt']),
      createdAt: formatISO(donor.createdAt),
      updatedAt: formatISO(donor.updatedAt),
    }
  }
}
