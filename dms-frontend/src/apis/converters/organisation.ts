import { parseISO } from 'date-fns'

import type { OrganisationDto, OrganisationSummaryDto } from '@shared/dtos'
import type { Organisation, OrganisationSummary } from '@shared/models'

export const convertDtoToOrganisationSummary = (
  dto: OrganisationSummaryDto,
): OrganisationSummary => {
  return {
    ...dto,
    createdAt: parseISO(dto.createdAt),
    updatedAt: parseISO(dto.updatedAt),
  }
}

export const convertDtoToOrganisation = (dto: OrganisationDto): Organisation => {
  return {
    ...dto,
    createdAt: parseISO(dto.createdAt),
    updatedAt: parseISO(dto.updatedAt),
  }
}
