import { NameSortOrder } from './sort-order.dto'

export class OrganisationRefDto {
  id: string
  name: string
}
export class OrganisationDto extends OrganisationRefDto {
  createdAt: string
  updatedAt: string
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

export class OrganisationRefSortOrder extends NameSortOrder {}
