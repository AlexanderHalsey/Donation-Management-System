import { defineStore } from 'pinia'

export const useTaxReceiptStore = defineStore('taxReceipt', () => {
  const cancel = async (taxReceiptId: string) => {
    // TODO
  }

  return {
    cancel,
  }
})
