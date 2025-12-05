import { ref } from 'vue'
import { defineStore } from 'pinia'

import { getTaxReceipts } from '@/apis/dms-api'

import type {
  TaxReceiptListFilter,
  TaxReceiptListPagination,
  TaxReceiptListPaginationRequest,
  TaxReceiptListItem,
} from '@shared/models'

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

  return {
    taxReceiptList,
    fetchTaxReceipts,
    filter,
    pagination,
    updateFilter,
  }
})
