import { ref } from 'vue'
import { defineStore } from 'pinia'

import {
  cancelTaxReceipt,
  getTaxReceipts,
  postIndividualTaxReceipt,
  postRetryFailedTaxReceiptGeneration,
} from '@/apis/dms-api'

import type {
  TaxReceiptListFilter,
  TaxReceiptListPagination,
  TaxReceiptListPaginationRequest,
  TaxReceiptListItem,
} from '@shared/models'
import type { CancelTaxReceiptFormData } from '@/features/taxReceipts'

export const useTaxReceiptListStore = defineStore('taxReceiptList', () => {
  const taxReceiptList = ref<TaxReceiptListItem[]>([])
  const pagination = ref<TaxReceiptListPagination>({
    page: 1,
    pageSize: 10,
    totalCount: 0,
  })

  const filter = ref<TaxReceiptListFilter>()

  const fetchTaxReceipts = async (paginationRequest: TaxReceiptListPaginationRequest) => {
    const response = await getTaxReceipts(paginationRequest, filter.value)
    taxReceiptList.value = response.taxReceipts
    pagination.value = response.pagination
  }

  const updateFilter = (newFilter?: TaxReceiptListFilter) => {
    filter.value = newFilter
  }

  const cancel = async (formData: CancelTaxReceiptFormData) => {
    await cancelTaxReceipt(formData.id, formData.canceledReason)
  }

  const createIndividualTaxReceipt = async (donationId: string) => {
    await postIndividualTaxReceipt(donationId)
  }

  const retryFailedTaxReceiptGeneration = async (taxReceiptId: string) => {
    await postRetryFailedTaxReceiptGeneration(taxReceiptId)
    const index = taxReceiptList.value.findIndex((taxReceipt) => taxReceipt.id === taxReceiptId)
    if (index !== -1) {
      taxReceiptList.value[index].status = 'COMPLETED'
    }
  }

  return {
    cancel,
    createIndividualTaxReceipt,
    fetchTaxReceipts,
    filter,
    pagination,
    retryFailedTaxReceiptGeneration,
    taxReceiptList,
    updateFilter,
  }
})
