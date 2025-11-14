import { parseISO } from 'date-fns'

import type { OrganisationDto } from '@shared/dtos'
import type { Organisation } from '@shared/models'

export const convertDtoToOrganisation = (dto: OrganisationDto): Organisation => {
  return {
    ...dto,
    createdAt: parseISO(dto.createdAt),
    updatedAt: parseISO(dto.updatedAt),
  }
}
