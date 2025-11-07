import { parseISO } from 'date-fns'

import type { DonationAssetTypeDto } from '@shared/dtos'
import type { DonationAssetType } from '@shared/models'

export const convertDtoToDonationAssetType = (dto: DonationAssetTypeDto): DonationAssetType => {
  return {
    ...dto,
    createdAt: parseISO(dto.createdAt),
    updatedAt: parseISO(dto.updatedAt),
  }
}
