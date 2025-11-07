export interface DonationSortOrder {
  createdAt?: SortOrder
  amount?: SortOrder
  paymentMode?: PaymentModeSortOrder
  organisation?: OrganisationSortOrder
  donationType?: DonationTypeSortOrder
  donationMethod?: DonationMethodSortOrder
  donationAssetType?: DonationAssetTypeSortOrder
}

export interface PaymentModeSortOrder extends NameSortOrder {}
export interface OrganisationSortOrder extends NameSortOrder {}
export interface DonationTypeSortOrder extends NameSortOrder {}
export interface DonationMethodSortOrder extends NameSortOrder {}
export interface DonationAssetTypeSortOrder extends NameSortOrder {}

interface NameSortOrder {
  name?: SortOrder
}

export type SortOrder = 'asc' | 'desc'
