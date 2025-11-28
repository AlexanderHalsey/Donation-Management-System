import { Injectable } from '@nestjs/common'

import { formatISO } from 'date-fns'
import { omit } from 'es-toolkit'

import { FileMetadataDto } from '../dtos'
import type { FileMetadata } from '@shared/models'

@Injectable()
export class FileConverter {
  constructor() {}

  convertFileMetadataToDto(fileMetadata: FileMetadata): FileMetadataDto {
    return {
      ...omit(fileMetadata, ['uploadedAt', 'expiresAt']),
      uploadedAt: formatISO(fileMetadata.uploadedAt),
      expiresAt: fileMetadata.expiresAt ? formatISO(fileMetadata.expiresAt) : undefined,
    }
  }
}
