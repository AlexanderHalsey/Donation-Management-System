export type OrganisationRef = {
  id: string
  name: string
}

export interface Organisation extends OrganisationRef {
  createdAt: Date
  updatedAt: Date
  title?: string
  address?: string
  locality?: string
  postCode?: string
  logoUrl?: string
  object?: string
  objectDescription?: string
  signatoryName?: string
  signatoryPosition?: string
  signatureUrl?: string
}
