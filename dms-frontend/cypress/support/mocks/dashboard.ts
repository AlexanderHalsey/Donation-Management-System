import type { GetDashboardSummaryResponse } from '@shared/dtos'
import { buildMockDonors } from './donor'
import { buildMockDonations } from './donation'
import { buildMockPaymentModes } from './paymentMode'
import { buildMockOrganisations } from './organisation'
import { buildMockDonationTypes } from './donationType'
import { buildMockDonationMethods } from './donationMethod'
import { buildMockDonationAssetTypes } from './donationAssetType'
import { buildMockTaxReceipts } from './taxReceipt'

export const buildMockDashboardSummaries = (
  includeDisabledDonors = false,
): GetDashboardSummaryResponse => {
  const donors = buildMockDonors()
  const paymentModes = buildMockPaymentModes()
  const organisations = buildMockOrganisations()
  const donationTypes = buildMockDonationTypes(organisations)
  const donationMethods = buildMockDonationMethods()
  const donationAssetTypes = buildMockDonationAssetTypes()
  const taxReceipts = buildMockTaxReceipts(donors)
  const donations = buildMockDonations(
    paymentModes,
    organisations,
    donationTypes,
    donationMethods,
    donationAssetTypes,
    donors,
  )

  return {
    totalDonations: {
      allTime: { count: 50000, amount: 1000000 },
      thisYear: { count: 2000, amount: 40000 },
      thisMonth: { count: 500, amount: 10000 },
    },
    currentWeekDonations: {
      count: 100,
      amount: 2000,
      donations,
    },
    topDonors: {
      byAmount: donors.sort((a, b) => b.donationTotalAmount - a.donationTotalAmount).slice(0, 10),
      byCount: donors.sort((a, b) => b.donationCount - a.donationCount).slice(0, 10),
    },
    disabledDonorsWithDonations: includeDisabledDonors
      ? donors.filter((donor) => donor.isDisabled && donor.donationCount > 0)
      : [],
    donationCharts: {
      paymentModes: paymentModes.map((mode) => ({
        name: mode.name,
        count: donations.filter((donation) => donation.paymentMode.id === mode.id).length,
        amount: donations
          .filter((donation) => donation.paymentMode.id === mode.id)
          .reduce((sum, donation) => sum + donation.amount, 0),
      })),
      organisations: organisations.map((org) => ({
        name: org.name,
        count: donations.filter((donation) => donation.organisation.id === org.id).length,
        amount: donations
          .filter((donation) => donation.organisation.id === org.id)
          .reduce((sum, donation) => sum + donation.amount, 0),
      })),
      donationTypes: donationTypes.map((type) => ({
        name: type.name,
        count: donations.filter((donation) => donation.donationType.id === type.id).length,
        amount: donations
          .filter((donation) => donation.donationType.id === type.id)
          .reduce((sum, donation) => sum + donation.amount, 0),
      })),
    },
    taxReceiptStatusCounts: taxReceipts.reduce(
      (acc, receipt) => {
        acc[receipt.status] = (acc[receipt.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ),
  }
}
