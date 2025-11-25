import { ref } from 'vue'
import { defineStore } from 'pinia'

import {
  deleteDonation as _deleteDonation,
  getDonation,
  postDonation,
  putDonation,
} from '@/apis/dms-api'

import type { Donation } from '@shared/models'
import type { DonationFormData } from '@/features/donations'

export const useDonationStore = defineStore('donation', () => {
  const donation = ref<Donation>()

  const fetchDonation = async (donationId: string) => {
    donation.value = await getDonation(donationId)
  }

  const createDonation = async (formData: DonationFormData) => {
    donation.value = await postDonation(formData)
  }

  const updateDonation = async (donationId: string, formData: DonationFormData) => {
    donation.value = await putDonation(donationId, formData)
  }

  const deleteDonation = async (donationId: string) => {
    await _deleteDonation(donationId)
    donation.value = undefined
  }

  return {
    createDonation,
    deleteDonation,
    donation,
    fetchDonation,
    updateDonation,
  }
})
