export interface DonationAssetTypeRef {
  id: string
  name: string
}

export interface DonationAssetType extends DonationAssetTypeRef {
  createdAt: Date
  updatedAt: Date
  isDefault: boolean
}
