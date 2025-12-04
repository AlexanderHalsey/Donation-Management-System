import { FileMetadata } from './File'

export type OrganisationRef = {
  id: string
  name: string
  isDisabled: boolean
}

export interface Organisation extends OrganisationRef {
  createdAt: Date
  updatedAt: Date
  title?: string
  address?: string
  locality?: string
  postCode?: string
  logo?: FileMetadata
  object?: string
  objectDescription?: string
  signatoryName?: string
  signatoryPosition?: string
  signature?: FileMetadata
}
