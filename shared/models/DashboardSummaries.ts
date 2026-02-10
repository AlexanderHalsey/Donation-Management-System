import type { DonorListItem } from './Donor'
import type { DonationRef } from './Donation'
import type { TaxReceiptStatus } from './TaxReceipt'

export interface AmountAndCount {
  count: number
  amount: number
}

export interface ChartItem extends AmountAndCount {
  name: string
}

export interface DashboardSummaries {
  totalDonations: {
    allTime: AmountAndCount
    thisYear: AmountAndCount
    thisMonth: AmountAndCount
  }
  currentWeekDonations: AmountAndCount & {
    donations: DonationRef[]
  }
  donationCharts: {
    paymentModes: ChartItem[]
    organisations: ChartItem[]
    donationTypes: ChartItem[]
  }
  topDonors: {
    byAmount: DonorListItem[]
    byCount: DonorListItem[]
  }
  disabledDonorsWithDonations: DonorListItem[]
  taxReceiptStatusCounts: Record<TaxReceiptStatus, number>
}
