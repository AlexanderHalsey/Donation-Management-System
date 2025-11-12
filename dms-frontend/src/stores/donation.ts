import { ref } from 'vue'
import { defineStore } from 'pinia'

import { getDonation, getDonations, getDonationsContext } from '@/apis/dms-api'

import type {
  Donation,
  DonationListPagination,
  DonationListPaginationRequest,
  DonationType,
  OrganisationSummary,
  PaymentMode,
} from '@shared/models'

export const useDonationStore = defineStore('donation', () => {
  const donationList = ref<Donation[]>([])
  const pagination = ref<DonationListPagination>({
    page: 1,
    pageSize: 10,
    orderBy: { createdAt: 'desc' },
    totalCount: 0,
  })
  const context = ref<{
    paymentModes: PaymentMode[]
    organisations: OrganisationSummary[]
    donationTypes: DonationType[]
  }>({
    paymentModes: [],
    organisations: [],
    donationTypes: [],
  })

  const fetchDonations = async (paginationRequest: DonationListPaginationRequest) => {
    const response = await getDonations(paginationRequest)
    donationList.value = response.donations
    pagination.value = response.pagination
  }

  const fetchContext = async () => {
    const response = await getDonationsContext()
    context.value = response
  }

  const fetchDonation = async (donationId: string) => {
    if (!donationList.value.find((donation) => donation.id === donationId)) {
      const donation = await getDonation(donationId)
      donationList.value.push(donation)
    }
  }

  return {
    context,
    donationList,
    fetchContext,
    fetchDonation,
    fetchDonations,
    pagination,
  }
})
