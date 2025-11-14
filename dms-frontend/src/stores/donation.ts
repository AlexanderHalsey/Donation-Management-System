import { ref } from 'vue'
import { defineStore } from 'pinia'

import { getDonation } from '@/apis/dms-api'

import type { Donation } from '@shared/models'

export const useDonationStore = defineStore('donation', () => {
  const donation = ref<Donation>()

  const fetchDonation = async (donationId: string) => {
    donation.value = await getDonation(donationId)
  }

  return {
    donation,
    fetchDonation,
  }
})
