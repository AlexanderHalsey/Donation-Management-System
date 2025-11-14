import { NameSortOrder } from './sort-order.dto'

export class DonationAssetTypeRefDto {
  id: string
  name: string
}

export class DonationAssetTypeDto extends DonationAssetTypeRefDto {
  createdAt: string
  updatedAt: string
  isDefault: boolean
}

export class DonationAssetTypeRefSortOrder extends NameSortOrder {}
