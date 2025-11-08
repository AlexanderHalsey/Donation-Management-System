import { NameSortOrder } from './sort-order.dto'

export class DonationAssetTypeDto {
  id: string
  createdAt: string
  updatedAt: string
  name: string
  isDefault: boolean
}

export class DonationAssetTypeListSortOrder extends NameSortOrder {}
