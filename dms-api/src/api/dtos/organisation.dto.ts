import { NameSortOrder } from './sort-order.dto'

export class OrganisationSummaryDto {
  id: string
  createdAt: string
  updatedAt: string
  name: string
}
export class OrganisationDto extends OrganisationSummaryDto {
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

export class OrganisationListSortOrder extends NameSortOrder {}
