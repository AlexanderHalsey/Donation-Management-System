import { NameSortOrder } from './sort-order.dto'

export class DonationTypeDto {
  id: string
  createdAt: string
  updatedAt: string
  name: string
  organisationId: string
}

export class DonationTypeListSortOrder extends NameSortOrder {}
