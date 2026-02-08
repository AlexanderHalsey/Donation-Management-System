import type { FileMetadata } from './File'

export type OrganisationRef = {
  id: string
  name: string
  isDisabled: boolean
  isTaxReceiptEnabled: boolean
}

export interface Organisation extends OrganisationRef {
  createdAt: Date
  updatedAt: Date
  title?: string
  streetAddress?: string
  city?: string
  postalCode?: string
  logo?: FileMetadata
  object?: string
  objectDescription?: string
  signatoryName?: string
  signatoryPosition?: string
  signature?: FileMetadata
}
