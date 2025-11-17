import { ref } from 'vue'
import { defineStore } from 'pinia'

import { getDonorRefs, getDonors } from '@/apis/dms-api'

import type {
  DonorListPagination,
  DonorListItem,
  DonorRef,
  DonorListPaginationRequest,
  DonorListFilter,
} from '@shared/models'

export const useDonorListStore = defineStore('donorList', () => {
  const donorRefList = ref<DonorRef[]>([])
  const refsInitialized = ref(false)
  const donorList = ref<DonorListItem[]>([])
  const pagination = ref<DonorListPagination>({
    page: 1,
    pageSize: 10,
    totalCount: 0,
  })
  const filter = ref<DonorListFilter>()

  const fetchDonorRefs = async () => {
    donorRefList.value = await getDonorRefs()
    refsInitialized.value = true
  }

  const fetchDonors = async (paginationRequest: DonorListPaginationRequest) => {
    const response = await getDonors(paginationRequest, filter.value)
    donorList.value = response.donors
    pagination.value = response.pagination
  }

  const updateFilter = (newFilter?: DonorListFilter) => {
    filter.value = newFilter
  }

  return {
    donorList,
    donorRefList,
    fetchDonorRefs,
    fetchDonors,
    filter,
    pagination,
    refsInitialized,
    updateFilter,
  }
})
