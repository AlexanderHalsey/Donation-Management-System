import { parseISO } from 'date-fns'

import type { FileMetadataDto } from '@shared/dtos'
import type { FileMetadata } from '@shared/models'

export const convertDtoToFileMetadata = (dto: FileMetadataDto): FileMetadata => {
  return {
    ...dto,
    uploadedAt: parseISO(dto.uploadedAt),
    expiresAt: dto.expiresAt ? parseISO(dto.expiresAt) : undefined,
  }
}
