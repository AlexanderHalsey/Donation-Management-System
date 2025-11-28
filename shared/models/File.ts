export type FileStatus = 'active' | 'draft'

export interface FileMetadata {
  id: string
  uploadedAt: Date
  expiresAt?: Date
  storageKey?: string
  name: string
  size: number
  mimeType: string
  hash: string
  status: FileStatus
}
