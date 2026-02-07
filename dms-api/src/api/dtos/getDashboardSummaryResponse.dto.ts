import { DonationRefDto } from './donation.dto'
import { DonorListItemDto } from './donor.dto'
import { TaxReceiptStatus } from './taxReceipt.dto'

export class ChartItemDto {
  name: string
  count: number
  amount: number
}

export class GetDashboardSummaryResponse {
  totalDonations: {
    allTime: { count: number; amount: number }
    thisYear: { count: number; amount: number }
    thisMonth: { count: number; amount: number }
  }
  currentWeekDonations: {
    count: number
    amount: number
    donations: DonationRefDto[]
  }
  topDonors: {
    byAmount: DonorListItemDto[]
    byCount: DonorListItemDto[]
  }
  disabledDonorsWithDonations: DonorListItemDto[]
  donationCharts: {
    paymentModes: ChartItemDto[]
    organisations: ChartItemDto[]
    donationTypes: ChartItemDto[]
  }
  taxReceiptStatusCounts: Record<TaxReceiptStatus, number>
}
