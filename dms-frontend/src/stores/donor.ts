import { ref } from 'vue'
import { defineStore } from 'pinia'

import { getDonor } from '@/apis/dms-api'

import type { Donor } from '@shared/models'

export const useDonorStore = defineStore('donor', () => {
  const donor = ref<Donor>()

  const fetchDonor = async (donorId: string) => {
    donor.value = await getDonor(donorId)
  }

  return {
    donor,
    fetchDonor,
  }
})
