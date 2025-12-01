import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { getDonationAssetTypes } from '@/apis/dms-api'

import type { DonationAssetType } from '@shared/models'

export const useDonationAssetTypeListStore = defineStore('donationAssetTypeList', () => {
  const donationAssetTypeList = ref<DonationAssetType[]>([])
  const initialized = ref(false)

  const activeDonationAssetTypeList = computed(() =>
    donationAssetTypeList.value.filter((type) => !type.isDisabled),
  )

  const fetchDonationAssetTypes = async () => {
    if (!initialized.value) {
      donationAssetTypeList.value = await getDonationAssetTypes()
      initialized.value = true
    }
  }

  return {
    activeDonationAssetTypeList,
    donationAssetTypeList,
    fetchDonationAssetTypes,
  }
})
