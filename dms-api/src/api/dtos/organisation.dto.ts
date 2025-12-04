import { FileMetadataDto } from './file-metadata.dto'
import { NameSortOrder } from './sort-order.dto'

export class OrganisationRefDto {
  id: string
  name: string
  isDisabled: boolean
}
export class OrganisationDto extends OrganisationRefDto {
  createdAt: string
  updatedAt: string
  title?: string
  address?: string
  locality?: string
  postCode?: string
  logo?: FileMetadataDto
  object?: string
  objectDescription?: string
  signatoryName?: string
  signatoryPosition?: string
  signature?: FileMetadataDto
}

export class OrganisationRefSortOrder extends NameSortOrder {}
