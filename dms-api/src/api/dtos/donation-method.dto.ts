import { NameSortOrder } from './sort-order.dto'

export class DonationMethodDto {
  id: string
  createdAt: string
  updatedAt: string
  name: string
  isDefault: boolean
}

export class DonationMethodListSortOrder extends NameSortOrder {}
