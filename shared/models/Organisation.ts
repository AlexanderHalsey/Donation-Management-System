export type OrganisationSummary = {
  id: string
  createdAt: Date
  updatedAt: Date
  name: string
}

export type Organisation = OrganisationSummary & {
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
