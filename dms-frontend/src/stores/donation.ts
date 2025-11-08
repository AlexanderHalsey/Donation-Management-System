import { ref } from 'vue'
import { defineStore } from 'pinia'

import { getDonation, getDonations } from '@/apis/dms-api'

import type {
  Donation,
  DonationListPagination,
  DonationListPaginationRequest,
} from '@shared/models'

export const useDonationStore = defineStore('donation', () => {
  const donationList = ref<Donation[]>([])
  const pagination = ref<DonationListPagination>()

  const fetchDonations = async (paginationRequest?: DonationListPaginationRequest) => {
    const response = await getDonations(paginationRequest)
    donationList.value = response.donations
    pagination.value = response.pagination
  }

  const fetchDonation = async (donationId: string) => {
    if (!donationList.value.find((donation) => donation.id === donationId)) {
      const donation = await getDonation(donationId)
      donationList.value.push(donation)
    }
  }

  return { donationList, pagination, fetchDonation, fetchDonations }
})
