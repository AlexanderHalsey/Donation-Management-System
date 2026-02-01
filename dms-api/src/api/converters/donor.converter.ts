import { Injectable } from '@nestjs/common'

import { formatISO } from 'date-fns'
import { omit } from 'es-toolkit'

import { DonorListItemDto } from '../dtos'
import type { DonorListItem } from '@shared/models'

@Injectable()
export class DonorConverter {
  constructor() {}

  convertDonorListItemToDto(donorListItem: DonorListItem): DonorListItemDto {
    return {
      ...omit(donorListItem, ['updatedAt']),
      updatedAt: formatISO(donorListItem.updatedAt),
    }
  }

  convertDonorToDto<T extends { createdAt: Date; updatedAt: Date }>(
    donor: T,
  ): Omit<T, 'createdAt' | 'updatedAt'> & {
    createdAt: string
    updatedAt: string
  } {
    return {
      ...omit(donor, ['updatedAt', 'createdAt']),
      createdAt: formatISO(donor.createdAt),
      updatedAt: formatISO(donor.updatedAt),
    }
  }
}
