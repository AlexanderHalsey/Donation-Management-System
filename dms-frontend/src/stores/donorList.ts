import { ref } from 'vue'
import { defineStore } from 'pinia'

import { getDonorRefs } from '@/apis/dms-api'

import type { DonorRef } from '@shared/models'

export const useDonorListStore = defineStore('donorList', () => {
  const donorRefList = ref<DonorRef[]>([])
  const refsInitialized = ref(false)

  const fetchDonorRefs = async () => {
    donorRefList.value = await getDonorRefs()
    refsInitialized.value = true
  }

  return {
    fetchDonorRefs,
    donorRefList,
    refsInitialized,
  }
})
