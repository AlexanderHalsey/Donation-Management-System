export class FileMetadataDto {
  id: string
  uploadedAt: string
  expiresAt?: string
  storageKey?: string
  name: string
  size: number
  mimeType: string
  hash: string
  status: 'draft' | 'active'
}
