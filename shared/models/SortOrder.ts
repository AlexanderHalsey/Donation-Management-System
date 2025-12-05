export interface DonationListSortOrder {
  updatedAt?: SortOrder
  donatedAt?: SortOrder
  amount?: SortOrder
  paymentMode?: PaymentModeSortOrder
  organisation?: OrganisationRefSortOrder
  donationType?: DonationTypeSortOrder
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

export interface TaxReceiptListSortOrder {
  donor?: DonorSummaryRefSortOrder
  createdAt?: SortOrder
  receiptNumber?: SortOrder
  type?: SortOrder
  file?: TaxReceiptFileSortOrder
}

export interface PaymentModeSortOrder extends NameSortOrder {}
export interface OrganisationRefSortOrder extends NameSortOrder {}
export interface DonationTypeSortOrder extends NameSortOrder {}
export interface DonationMethodSortOrder extends NameSortOrder {}
export interface DonationAssetTypeSortOrder extends NameSortOrder {}
export interface TaxReceiptFileSortOrder extends NameSortOrder {}
export interface DonorSummaryRefSortOrder {
  lastName?: SortOrder
}

interface NameSortOrder {
  name?: SortOrder
}

export type SortOrder = 'asc' | 'desc'
