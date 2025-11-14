import { NameSortOrder } from './sort-order.dto'

export class DonationMethodRefDto {
  id: string
  name: string
}

export class DonationMethodDto extends DonationMethodRefDto {
  createdAt: string
  updatedAt: string
  isDefault: boolean
}

export class DonationMethodRefSortOrder extends NameSortOrder {}
