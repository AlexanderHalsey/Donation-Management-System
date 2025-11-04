import { Injectable } from '@nestjs/common'

import { formatISO } from 'date-fns'
import { omit } from 'es-toolkit'

import { OrganisationDto, OrganisationSummaryDto } from '../dtos'
import { Organisation, OrganisationSummary } from '@shared/models'

@Injectable()
export class OrganisationConverter {
  constructor() {}

  convertOrganisationSummaryToDto(
    organisationSummary: OrganisationSummary,
  ): OrganisationSummaryDto {
    return {
      ...omit(organisationSummary, ['createdAt', 'updatedAt']),
      createdAt: formatISO(organisationSummary.createdAt),
      updatedAt: formatISO(organisationSummary.updatedAt),
    }
  }

  convertOrganisationToDto(organisation: Organisation): OrganisationDto {
    return {
      ...omit(organisation, ['createdAt', 'updatedAt']),
      createdAt: formatISO(organisation.createdAt),
      updatedAt: formatISO(organisation.updatedAt),
    }
  }
}
