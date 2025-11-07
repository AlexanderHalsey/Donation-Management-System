import type { DonationAssetType } from './DonationAssetType'
import type { DonationMethod } from './DonationMethod'
import type { DonationType } from './DonationType'
import type { OrganisationSummary } from './Organisation'
import type { PaymentMode } from './PaymentMode'

export type Donation = {
  id: string
  createdAt: Date
  updatedAt: Date
  donatedAt: Date
  amount: number
  paymentMode: PaymentMode
  organisation: OrganisationSummary
  donationType: DonationType
  donationMethod: DonationMethod
  donationAssetType: DonationAssetType
  isDisabled: boolean
  contactId: string
  receiptId?: string
}
