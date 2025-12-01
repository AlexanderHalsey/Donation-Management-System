import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { getPaymentModes } from '@/apis/dms-api'

import type { PaymentMode } from '@shared/models'

export const usePaymentModeListStore = defineStore('paymentModeList', () => {
  const paymentModeList = ref<PaymentMode[]>([])
  const initialized = ref(false)

  const activePaymentModeList = computed(() =>
    paymentModeList.value.filter((paymentMode) => !paymentMode.isDisabled),
  )

  const fetchPaymentModes = async () => {
    if (!initialized.value) {
      paymentModeList.value = await getPaymentModes()
      initialized.value = true
    }
  }

  return {
    activePaymentModeList,
    fetchPaymentModes,
    initialized,
    paymentModeList,
  }
})
