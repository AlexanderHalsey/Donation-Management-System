import { NameSortOrder } from './sort-order.dto'

export class DonationAssetTypeDto {
  id: string
  name: string
  isDisabled: boolean
  createdAt: string
  updatedAt: string
  isDefault: boolean
}

export class DonationAssetTypeSortOrder extends NameSortOrder {}
