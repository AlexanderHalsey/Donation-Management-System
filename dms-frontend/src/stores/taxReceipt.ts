import { defineStore } from 'pinia'

import { cancelTaxReceipt } from '@/apis/dms-api'

import type { CancelTaxReceiptFormData } from '@/features/taxReceipts'

export const useTaxReceiptStore = defineStore('taxReceipt', () => {
  const cancel = async (formData: CancelTaxReceiptFormData) => {
    await cancelTaxReceipt(formData.id, formData.canceledReason)
  }

  return {
    cancel,
  }
})
