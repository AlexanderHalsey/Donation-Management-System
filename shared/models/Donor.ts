export type DonorSummary = {
  id: string
  createdAt: Date
  updatedAt: Date
  firstName?: string
  lastName: string
}

export type Donor = DonorSummary & {
  email?: string
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
  donationCount: number
  donationTotalAmount: number
}
