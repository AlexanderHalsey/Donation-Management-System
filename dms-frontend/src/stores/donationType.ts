import { ref } from 'vue'
import { defineStore } from 'pinia'

import { useDonationTypeListStore } from './donationTypeList'

import {
  disableDonationType,
  getDonationType,
  postDonationType,
  putDonationType,
} from '@/apis/dms-api'

import type { DonationType } from '@shared/models'
import type { DonationTypeFormData } from '@/features/donationTypes'

export const useDonationTypeStore = defineStore('donationType', () => {
  const donationTypeListStore = useDonationTypeListStore()

  const donationType = ref<DonationType>()

  const fetchDonationType = async (donationTypeId: string) => {
    donationType.value = await getDonationType(donationTypeId)
  }

  const createDonationType = async (formData: DonationTypeFormData) => {
    donationType.value = await postDonationType(formData)
    donationTypeListStore.donationTypeList.push(donationType.value)
  }

  const updateDonationType = async (donationTypeId: string, formData: DonationTypeFormData) => {
    donationType.value = await putDonationType(donationTypeId, formData)
    const index = donationTypeListStore.donationTypeList.findIndex(
      (donationType) => donationType.id === donationTypeId,
    )
    if (index !== -1) {
      donationTypeListStore.donationTypeList[index] = donationType.value
    }
  }

  const deleteDonationType = async (donationTypeId: string) => {
    await disableDonationType(donationTypeId)
    donationType.value = undefined
    const index = donationTypeListStore.donationTypeList.findIndex(
      (donationType) => donationType.id === donationTypeId,
    )
    if (index !== -1) {
      donationTypeListStore.donationTypeList.splice(index, 1)
    }
  }

  return {
    createDonationType,
    deleteDonationType,
    donationType,
    fetchDonationType,
    updateDonationType,
  }
})
