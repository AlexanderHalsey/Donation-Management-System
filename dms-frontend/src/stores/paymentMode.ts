import { ref } from 'vue'
import { defineStore } from 'pinia'

import { usePaymentModeListStore } from './paymentModeList'

import { disablePaymentMode, getPaymentMode, postPaymentMode, putPaymentMode } from '@/apis/dms-api'

import type { PaymentMode } from '@shared/models'
import type { PaymentModeFormData } from '@/features/paymentModes'

export const usePaymentModeStore = defineStore('paymentMode', () => {
  const paymentModeListStore = usePaymentModeListStore()

  const paymentMode = ref<PaymentMode>()

  const fetchPaymentMode = async (paymentModeId: string) => {
    paymentMode.value = await getPaymentMode(paymentModeId)
  }

  const createPaymentMode = async (formData: PaymentModeFormData) => {
    paymentMode.value = await postPaymentMode(formData)
    paymentModeListStore.paymentModeList.push(paymentMode.value)
  }

  const updatePaymentMode = async (paymentModeId: string, formData: PaymentModeFormData) => {
    paymentMode.value = await putPaymentMode(paymentModeId, formData)
    const index = paymentModeListStore.paymentModeList.findIndex(
      (paymentMode) => paymentMode.id === paymentModeId,
    )
    if (index !== -1) {
      paymentModeListStore.paymentModeList[index] = paymentMode.value
    }
  }

  const deletePaymentMode = async (paymentModeId: string) => {
    await disablePaymentMode(paymentModeId)
    paymentMode.value = undefined
    const index = paymentModeListStore.paymentModeList.findIndex(
      (paymentMode) => paymentMode.id === paymentModeId,
    )
    if (index !== -1) {
      paymentModeListStore.paymentModeList.splice(index, 1)
    }
  }

  return {
    createPaymentMode,
    deletePaymentMode,
    paymentMode,
    fetchPaymentMode,
    updatePaymentMode,
  }
})
