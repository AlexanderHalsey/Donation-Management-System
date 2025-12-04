import { Injectable } from '@nestjs/common'

import { formatISO } from 'date-fns'
import { omit } from 'es-toolkit'

import { FileConverter } from './file.converter'

import { OrganisationDto } from '../dtos'
import { Organisation } from '@shared/models'

@Injectable()
export class OrganisationConverter {
  constructor(private readonly fileConverter: FileConverter) {}

  convertOrganisationToDto(organisation: Organisation): OrganisationDto {
    return {
      ...omit(organisation, ['createdAt', 'updatedAt', 'logo', 'signature']),
      createdAt: formatISO(organisation.createdAt),
      updatedAt: formatISO(organisation.updatedAt),
      logo: organisation.logo && this.fileConverter.convertFileMetadataToDto(organisation.logo),
      signature:
        organisation.signature &&
        this.fileConverter.convertFileMetadataToDto(organisation.signature),
    }
  }
}
