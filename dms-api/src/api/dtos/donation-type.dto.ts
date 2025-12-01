import { NameSortOrder } from './sort-order.dto'

export class DonationTypeDto {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  isDisabled: boolean
  organisationId: string
}

export class DonationTypeSortOrder extends NameSortOrder {}
