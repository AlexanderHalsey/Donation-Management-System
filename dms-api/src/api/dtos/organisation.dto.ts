import { FileMetadataDto } from './fileMetadata.dto'
import { NameSortOrder } from './sortOrder.dto'

export class OrganisationRefDto {
  id: string
  name: string
  isDisabled: boolean
  isTaxReceiptEnabled: boolean
}
export class OrganisationDto extends OrganisationRefDto {
  createdAt: string
  updatedAt: string
  title?: string
  streetAddress?: string
  city?: string
  postalCode?: string
  logo?: FileMetadataDto
  object?: string
  objectDescription?: string
  signatoryName?: string
  signatoryPosition?: string
  signature?: FileMetadataDto
}

export class OrganisationRefSortOrder extends NameSortOrder {}
