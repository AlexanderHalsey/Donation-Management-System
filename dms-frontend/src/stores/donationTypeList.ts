import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { getDonationTypes } from '@/apis/dms-api'

import type { DonationType } from '@shared/models'

export const useDonationTypeListStore = defineStore('donationTypeList', () => {
  const donationTypeList = ref<DonationType[]>([])
  const initialized = ref(false)

  const activeDonationTypeList = computed(() =>
    donationTypeList.value.filter((donationType) => !donationType.isDisabled),
  )

  const fetchDonationTypes = async () => {
    if (!initialized.value) {
      donationTypeList.value = await getDonationTypes()
      initialized.value = true
    }
  }

  return {
    activeDonationTypeList,
    fetchDonationTypes,
    initialized,
    donationTypeList,
  }
})
