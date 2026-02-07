import { DonorListItem } from './Donor'
import { DonationRef } from './Donation'
import { TaxReceiptStatus } from './TaxReceipt'

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
