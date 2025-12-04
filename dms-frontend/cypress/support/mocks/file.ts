import { v4 } from 'uuid'

import type { FileMetadata } from '@shared/models'

export type FileUploadResponseMock = {
  id: string
}

export function buildMockImage(): FileUploadResponseMock {
  return {
    id: v4(),
  }
}

export function buildMockFile({ name }: { name?: string } = {}): FileMetadata {
  return {
    id: v4(),
    uploadedAt: new Date(),
    expiresAt: undefined,
    storageKey: undefined,
    name: name ?? 'mock-image.png',
    size: 1024,
    mimeType: 'image/png',
    hash: 'mockhash',
    status: 'active',
  }
}
