import { Injectable } from '@nestjs/common'

import { formatISO } from 'date-fns'
import { omit } from 'es-toolkit'

import { DonorDto, DonorListItemDto } from '../dtos'
import type { Donor, DonorListItem } from '@shared/models'

@Injectable()
export class DonorConverter {
  constructor() {}

  convertDonorListItemToDto(donorListItem: DonorListItem): DonorListItemDto {
    return {
      ...omit(donorListItem, ['updatedAt']),
      updatedAt: formatISO(donorListItem.updatedAt),
    }
  }

  convertDonorToDto(donor: Donor): DonorDto {
    return {
      ...omit(donor, ['updatedAt', 'createdAt']),
      createdAt: formatISO(donor.createdAt),
      updatedAt: formatISO(donor.updatedAt),
    }
  }
}
