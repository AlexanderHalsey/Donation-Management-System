import { ref } from 'vue'
import { defineStore } from 'pinia'

import { getDonationMethods } from '@/apis/dms-api'

import type { DonationMethod } from '@shared/models'

export const useDonationMethodListStore = defineStore('donationMethodList', () => {
  const donationMethodList = ref<DonationMethod[]>([])
  const initialized = ref(false)

  const fetchDonationMethods = async () => {
    if (!initialized.value) {
      donationMethodList.value = await getDonationMethods()
      initialized.value = true
    }
  }

  return {
    fetchDonationMethods,
    initialized,
    donationMethodList,
  }
})
