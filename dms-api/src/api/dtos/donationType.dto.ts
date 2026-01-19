import { NameSortOrder } from './sortOrder.dto'

export class DonationTypeDto {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  isDisabled: boolean
  organisationId: string
  isTaxReceiptEnabled: boolean
}

export class DonationTypeSortOrder extends NameSortOrder {}
