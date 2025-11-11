import { DonationTypeDto } from './donation-type.dto'
import { OrganisationSummaryDto } from './organisation.dto'
import { PaymentModeDto } from './payment-mode.dto'

export class GetDonationListContextResponse {
  paymentModes: PaymentModeDto[]
  organisations: OrganisationSummaryDto[]
  donationTypes: DonationTypeDto[]
}
