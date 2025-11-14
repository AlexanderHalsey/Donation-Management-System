export interface DonorRef {
  id: string
  firstName?: string
  lastName: string
}

export interface DonorListItem extends DonorRef {
  updatedAt: Date
  externalId: number
  donationCount: number
  donationTotalAmount: number
  email?: string
}

export interface Donor extends DonorListItem {
  createdAt: Date
  phoneNumber?: string
  civility?: string
  streetAddress1?: string
  streetAddress2?: string
  postalCode?: string
  city?: string
  state?: string
  country?: string
  isFacilitator: boolean
  isDisabled: boolean
}
