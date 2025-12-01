export interface DonationListSortOrder {
  updatedAt?: SortOrder
  donatedAt?: SortOrder
  amount?: SortOrder
  paymentMode?: PaymentModeSortOrder
  organisation?: OrganisationRefSortOrder
  donationType?: DonationTypeRefSortOrder
  donationMethod?: DonationMethodSortOrder
  donationAssetType?: DonationAssetTypeSortOrder
  donor?: DonorSummaryRefSortOrder
}

export interface DonorListSortOrder extends DonorSummaryRefSortOrder {
  updatedAt?: SortOrder
  donationCount?: SortOrder
  donationTotalAmount?: SortOrder
  email?: SortOrder
}

export interface PaymentModeSortOrder extends NameSortOrder {}
export interface OrganisationRefSortOrder extends NameSortOrder {}
export interface DonationTypeRefSortOrder extends NameSortOrder {}
export interface DonationMethodSortOrder extends NameSortOrder {}
export interface DonationAssetTypeSortOrder extends NameSortOrder {}
export interface DonorSummaryRefSortOrder {
  lastName?: SortOrder
}

interface NameSortOrder {
  name?: SortOrder
}

export type SortOrder = 'asc' | 'desc'
