import { NameSortOrder } from './sortOrder.dto'

export class DonationMethodDto {
  id: string
  name: string
  isDisabled: boolean
  createdAt: string
  updatedAt: string
  isDefault: boolean
}

export class DonationMethodSortOrder extends NameSortOrder {}
