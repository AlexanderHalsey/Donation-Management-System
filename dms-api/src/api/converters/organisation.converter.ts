import { Injectable } from '@nestjs/common'

import { formatISO } from 'date-fns'
import { omit } from 'es-toolkit'

import { OrganisationDto } from '../dtos'
import { Organisation } from '@shared/models'

@Injectable()
export class OrganisationConverter {
  constructor() {}

  convertOrganisationToDto(organisation: Organisation): OrganisationDto {
    return {
      ...omit(organisation, ['createdAt', 'updatedAt']),
      createdAt: formatISO(organisation.createdAt),
      updatedAt: formatISO(organisation.updatedAt),
    }
  }
}
