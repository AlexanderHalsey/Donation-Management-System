export interface DonationListSortOrder {
  createdAt?: SortOrder
  donatedAt?: SortOrder
  amount?: SortOrder
  paymentMode?: PaymentModeListSortOrder
  organisation?: OrganisationListSortOrder
  donationType?: DonationTypeListSortOrder
  donationMethod?: DonationMethodListSortOrder
  donationAssetType?: DonationAssetTypeListSortOrder
  donor?: DonorSummaryListSortOrder
}

export interface DonorListSortOrder extends DonorSummaryListSortOrder {
  donationCount?: SortOrder
  donationTotalAmount?: SortOrder
  email?: SortOrder
}

export interface PaymentModeListSortOrder extends NameSortOrder {}
export interface OrganisationListSortOrder extends NameSortOrder {}
export interface DonationTypeListSortOrder extends NameSortOrder {}
export interface DonationMethodListSortOrder extends NameSortOrder {}
export interface DonationAssetTypeListSortOrder extends NameSortOrder {}
export interface DonorSummaryListSortOrder {
  lastName?: SortOrder
}

interface NameSortOrder {
  name?: SortOrder
}

export type SortOrder = 'asc' | 'desc'
