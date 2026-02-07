import { v4 } from 'uuid'

import type { FileMetadataDto } from '@shared/dtos'

export type FileUploadResponseMock = {
  id: string
}

export function buildMockImage(): FileUploadResponseMock {
  return {
    id: v4(),
  }
}

export function buildMockFile({ name }: { name?: string } = {}): FileMetadataDto {
  return {
    id: v4(),
    uploadedAt: new Date().toISOString(),
    expiresAt: undefined,
    storageKey: 'mock/storage/key',
    name: name ?? 'mock-image.png',
    size: 1024,
    mimeType: 'image/png',
    hash: 'mockhash',
    status: 'active',
  }
}
