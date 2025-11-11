export interface DonationListSortOrder {
  createdAt?: SortOrder
  donatedAt?: SortOrder
  amount?: SortOrder
  paymentMode?: PaymentModeListSortOrder
  organisation?: OrganisationListSortOrder
  donationType?: DonationTypeListSortOrder
  donationMethod?: DonationMethodListSortOrder
  donationAssetType?: DonationAssetTypeListSortOrder
}

export interface PaymentModeListSortOrder extends NameSortOrder {}
export interface OrganisationListSortOrder extends NameSortOrder {}
export interface DonationTypeListSortOrder extends NameSortOrder {}
export interface DonationMethodListSortOrder extends NameSortOrder {}
export interface DonationAssetTypeListSortOrder extends NameSortOrder {}

interface NameSortOrder {
  name?: SortOrder
}

export type SortOrder = 'asc' | 'desc'
