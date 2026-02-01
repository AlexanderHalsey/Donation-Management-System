import { ref } from 'vue'
import { defineStore } from 'pinia'

import {
  getEligibleTaxReceiptDonors,
  getEligibleTaxReceiptYearOrganisations,
  postAnnualBulkTaxReceipts,
} from '@/apis/dms-api'

import type { AnnualTaxReceiptsFormData } from '@/features/taxReceipts'
import type { EligibleTaxReceiptDonor } from '@shared/models'

export const useAnnualTaxReceiptsStore = defineStore('annualTaxReceipts', () => {
  const eligibleTaxReceiptYearOrganisations = ref<{
    yearOrganisationPairs: {
      year: number
      isReleased: boolean
      organisationId: string
    }[]
    releaseDate: Date
  }>()

  const eligibleTaxReceiptDonors = ref<EligibleTaxReceiptDonor[]>([])

  const fetchEligibleTaxReceiptYearOrganisations = async () => {
    eligibleTaxReceiptYearOrganisations.value = await getEligibleTaxReceiptYearOrganisations()
  }

  const fetchEligibleTaxReceiptDonors = async ({
    year,
    organisationId,
  }: {
    year: number
    organisationId: string
  }) => {
    eligibleTaxReceiptDonors.value = await getEligibleTaxReceiptDonors(year, organisationId)
  }

  const createAnnualTaxReceipts = async ({
    year,
    organisationId,
    formData,
  }: {
    year: number
    organisationId: string
    formData: AnnualTaxReceiptsFormData
  }) => {
    if (!eligibleTaxReceiptDonors.value) {
      throw new Error('Eligible tax receipt donors have not been loaded')
    }
    await postAnnualBulkTaxReceipts(year, organisationId, formData)
  }

  return {
    createAnnualTaxReceipts,
    fetchEligibleTaxReceiptDonors,
    fetchEligibleTaxReceiptYearOrganisations,
    eligibleTaxReceiptDonors,
    eligibleTaxReceiptYearOrganisations,
  }
})
