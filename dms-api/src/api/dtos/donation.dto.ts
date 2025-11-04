import { OrganisationSummaryDto } from './organisation.dto'
import { DonationTypeDto } from './donation-type.dto'
import { DonationMethodDto } from './donation-method.dto'
import { DonationAssetTypeDto } from './donation-asset-type.dto'
import { PaymentModeDto } from './payment-mode.dto'

export class DonationDto {
  id: string
  createdAt: string
  updatedAt: string
  amount: number
  paymentMode: PaymentModeDto
  organisation: OrganisationSummaryDto
  donationType: DonationTypeDto
  donationMethod: DonationMethodDto
  donationAssetType: DonationAssetTypeDto
  isDisabled: boolean
  contactId: string
  receiptId?: string
}
