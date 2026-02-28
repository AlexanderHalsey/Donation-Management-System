import { ref } from 'vue'
import { defineStore } from 'pinia'

import { exportDonationListCsv, getDonations } from '@/apis/dms-api'

import type {
  DonationListFilter,
  DonationListPagination,
  DonationListPaginationRequest,
  DonationListItem,
} from '@shared/models'

export const useDonationListStore = defineStore('donationList', () => {
  const donationList = ref<DonationListItem[]>([])
  const pagination = ref<DonationListPagination>({
    page: 1,
    pageSize: 10,
    totalCount: 0,
  })

  const filter = ref<DonationListFilter>()

  const fetchDonations = async (paginationRequest: DonationListPaginationRequest) => {
    const response = await getDonations(paginationRequest, filter.value)
    donationList.value = response.donations
    pagination.value = response.pagination
  }

  const updateFilter = (newFilter?: DonationListFilter) => {
    filter.value = newFilter
  }

  const exportCsv = () => {
    return exportDonationListCsv(pagination.value.orderBy ?? {}, filter.value)
  }

  return {
    donationList,
    exportCsv,
    fetchDonations,
    filter,
    pagination,
    updateFilter,
  }
})
