import { ref } from 'vue'
import { defineStore } from 'pinia'

import { useDonationAssetTypeListStore } from './donationAssetTypeList'

import {
  disableDonationAssetType,
  getDonationAssetType,
  postDonationAssetType,
  putDonationAssetType,
} from '@/apis/dms-api'

import type { DonationAssetType } from '@shared/models'
import type { DonationAssetTypeFormData } from '@/features/donationAssetTypes'

export const useDonationAssetTypeStore = defineStore('donationAssetType', () => {
  const donationAssetTypeListStore = useDonationAssetTypeListStore()

  const donationAssetType = ref<DonationAssetType>()

  const fetchDonationAssetType = async (donationAssetTypeId: string) => {
    donationAssetType.value = await getDonationAssetType(donationAssetTypeId)
  }

  const createDonationAssetType = async (formData: DonationAssetTypeFormData) => {
    donationAssetType.value = await postDonationAssetType(formData)
    if (formData.isDefault) {
      donationAssetTypeListStore.donationAssetTypeList.forEach((type) => {
        type.isDefault = false
      })
    }
    donationAssetTypeListStore.donationAssetTypeList.push(donationAssetType.value)
  }

  const updateDonationAssetType = async (
    donationAssetTypeId: string,
    formData: DonationAssetTypeFormData,
  ) => {
    donationAssetType.value = await putDonationAssetType(donationAssetTypeId, formData)
    if (formData.isDefault) {
      donationAssetTypeListStore.donationAssetTypeList.forEach((type) => {
        if (type.id !== donationAssetTypeId) {
          type.isDefault = false
        }
      })
    }
    const index = donationAssetTypeListStore.donationAssetTypeList.findIndex(
      (type) => type.id === donationAssetTypeId,
    )
    if (index !== -1) {
      donationAssetTypeListStore.donationAssetTypeList[index] = donationAssetType.value
    }
  }

  const deleteDonationAssetType = async (donationAssetTypeId: string) => {
    await disableDonationAssetType(donationAssetTypeId)
    donationAssetType.value = undefined
    const index = donationAssetTypeListStore.donationAssetTypeList.findIndex(
      (type) => type.id === donationAssetTypeId,
    )
    if (index !== -1) {
      donationAssetTypeListStore.donationAssetTypeList.splice(index, 1)
    }
  }

  return {
    createDonationAssetType,
    deleteDonationAssetType,
    donationAssetType,
    fetchDonationAssetType,
    updateDonationAssetType,
  }
})
