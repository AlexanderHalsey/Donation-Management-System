import { ref } from 'vue'
import { defineStore } from 'pinia'

import { getPaymentModes } from '@/apis/dms-api'

import type { PaymentMode } from '@shared/models'

export const usePaymentModeListStore = defineStore('paymentModeList', () => {
  const paymentModeList = ref<PaymentMode[]>([])
  const initialized = ref(false)

  const fetchPaymentModes = async () => {
    paymentModeList.value = await getPaymentModes()
    initialized.value = true
  }

  return {
    fetchPaymentModes,
    initialized,
    paymentModeList,
  }
})
