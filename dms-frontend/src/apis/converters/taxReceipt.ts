import { parseISO } from 'date-fns'
import { omit } from 'es-toolkit'

import { convertDtoToDonor } from './donor'
import { convertDtoToDonationListItem } from './donation'

import type { EligibleTaxReceiptDonorDto, TaxReceiptListItemDto } from '@shared/dtos'
import type { EligibleTaxReceiptDonor, TaxReceiptListItem } from '@shared/models'

export const convertDtoToTaxReceiptListItem = (dto: TaxReceiptListItemDto): TaxReceiptListItem => {
  return {
    ...dto,
    createdAt: parseISO(dto.createdAt),
    updatedAt: parseISO(dto.updatedAt),
    canceledAt: dto.canceledAt ? parseISO(dto.canceledAt) : undefined,
  }
}

export const convertDtoToEligibleTaxReceiptDonor = (
  dto: EligibleTaxReceiptDonorDto,
): EligibleTaxReceiptDonor => {
  return {
    ...convertDtoToDonor(omit(dto, ['donations'])),
    donations: dto.donations.map((donation) => convertDtoToDonationListItem(donation)),
  }
}
