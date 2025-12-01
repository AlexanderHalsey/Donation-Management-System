import { ref } from 'vue'
import { defineStore } from 'pinia'

import { useDonationMethodListStore } from './donationMethodList'

import {
  disableDonationMethod,
  getDonationMethod,
  postDonationMethod,
  putDonationMethod,
} from '@/apis/dms-api'

import type { DonationMethod } from '@shared/models'
import type { DonationMethodFormData } from '@/features/donationMethods'

export const useDonationMethodStore = defineStore('donationMethod', () => {
  const donationMethodListStore = useDonationMethodListStore()

  const donationMethod = ref<DonationMethod>()

  const fetchDonationMethod = async (donationMethodId: string) => {
    donationMethod.value = await getDonationMethod(donationMethodId)
  }

  const createDonationMethod = async (formData: DonationMethodFormData) => {
    donationMethod.value = await postDonationMethod(formData)
    if (formData.isDefault) {
      donationMethodListStore.donationMethodList.forEach((method) => {
        method.isDefault = false
      })
    }
    donationMethodListStore.donationMethodList.push(donationMethod.value)
  }

  const updateDonationMethod = async (
    donationMethodId: string,
    formData: DonationMethodFormData,
  ) => {
    donationMethod.value = await putDonationMethod(donationMethodId, formData)
    if (formData.isDefault) {
      donationMethodListStore.donationMethodList.forEach((method) => {
        if (method.id !== donationMethodId) {
          method.isDefault = false
        }
      })
    }
    const index = donationMethodListStore.donationMethodList.findIndex(
      (method) => method.id === donationMethodId,
    )
    if (index !== -1) {
      donationMethodListStore.donationMethodList[index] = donationMethod.value
    }
  }

  const deleteDonationMethod = async (donationMethodId: string) => {
    await disableDonationMethod(donationMethodId)
    donationMethod.value = undefined
    const index = donationMethodListStore.donationMethodList.findIndex(
      (method) => method.id === donationMethodId,
    )
    if (index !== -1) {
      donationMethodListStore.donationMethodList.splice(index, 1)
    }
  }

  return {
    createDonationMethod,
    deleteDonationMethod,
    donationMethod,
    fetchDonationMethod,
    updateDonationMethod,
  }
})
