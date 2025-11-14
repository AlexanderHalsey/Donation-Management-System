import { ref } from 'vue'
import { defineStore } from 'pinia'

import { getDonationTypes } from '@/apis/dms-api'

import type { DonationType } from '@shared/models'

export const useDonationTypeListStore = defineStore('donationTypeList', () => {
  const donationTypeList = ref<DonationType[]>([])
  const initialized = ref(false)

  const fetchDonationTypes = async () => {
    donationTypeList.value = await getDonationTypes()
    initialized.value = true
  }

  return {
    fetchDonationTypes,
    initialized,
    donationTypeList,
  }
})
