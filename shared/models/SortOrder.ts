export interface DonationListSortOrder {
  updatedAt?: SortOrder
  donatedAt?: SortOrder
  amount?: SortOrder
  paymentMode?: PaymentModeRefSortOrder
  organisation?: OrganisationRefSortOrder
  donationType?: DonationTypeRefSortOrder
  donationMethod?: DonationMethodRefSortOrder
  donationAssetType?: DonationAssetTypeSortOrder
  donor?: DonorSummaryRefSortOrder
}

export interface DonorListSortOrder extends DonorSummaryRefSortOrder {
  updatedAt?: SortOrder
  donationCount?: SortOrder
  donationTotalAmount?: SortOrder
  email?: SortOrder
}

export interface PaymentModeRefSortOrder extends NameSortOrder {}
export interface OrganisationRefSortOrder extends NameSortOrder {}
export interface DonationTypeRefSortOrder extends NameSortOrder {}
export interface DonationMethodRefSortOrder extends NameSortOrder {}
export interface DonationAssetTypeSortOrder extends NameSortOrder {}
export interface DonorSummaryRefSortOrder {
  lastName?: SortOrder
}

interface NameSortOrder {
  name?: SortOrder
}

export type SortOrder = 'asc' | 'desc'
