import { parseISO } from 'date-fns'

import { convertDtoToFileMetadata } from './fileMetadata'

import type { OrganisationDto } from '@shared/dtos'
import type { Organisation } from '@shared/models'

export const convertDtoToOrganisation = (dto: OrganisationDto): Organisation => {
  return {
    ...dto,
    createdAt: parseISO(dto.createdAt),
    updatedAt: parseISO(dto.updatedAt),
    logo: dto.logo ? convertDtoToFileMetadata(dto.logo) : undefined,
    signature: dto.signature ? convertDtoToFileMetadata(dto.signature) : undefined,
  }
}
