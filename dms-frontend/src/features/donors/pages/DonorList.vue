<template>
  <Page title="Liste des donateurs" :breadcrumbs="breadcrumbs" :loading="loading">
    <template #actions>
      <DonorListFilter
        :filter="filter"
        :donor-refs="donorRefs"
        data-cy="donor-list-filter"
        @update:filter="onFilterUpdate"
      />
    </template>
    <DonorListTable
      :donor-list="donorList"
      :pagination="pagination"
      :loading="tableLoading"
      data-cy="donor-list-table"
      @update:pagination="fetchDonors"
    />
  </Page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { omit } from 'es-toolkit'

import Page from '@/layouts/Page.vue'

import DonorListTable from '../components/DonorListTable.vue'
import DonorListFilter from '../components/DonorListFilter.vue'

import { useDonorListStore } from '@/stores'

import type { Breadcrumb, LazySelectOptions } from '@/types'
import type {
  DonorListFilter as DonorListFilterRequest,
  DonorListPaginationRequest,
  DonorRef,
} from '@shared/models'

const breadcrumbs: Breadcrumb[] = [
  { id: 'donor-list', label: 'Liste des donateurs', icon: 'group' },
]

const donorListStore = useDonorListStore()

const donorList = computed(() => donorListStore.donorList)
const pagination = computed(() => donorListStore.pagination)
const paginationRequest = computed<DonorListPaginationRequest>(() =>
  omit(pagination.value, ['totalCount']),
)
const filter = computed(() => donorListStore.filter)

const donorRefs = computed<LazySelectOptions<DonorRef>>(() => ({
  options: donorListStore.donorRefList,
  load: async () => {
    if (!donorListStore.refsInitialized) {
      await donorListStore.fetchDonorRefs()
    }
  },
}))

const loading = ref(true)
const tableLoading = ref(false)

const fetchDonors = async (paginationRequest: DonorListPaginationRequest) => {
  tableLoading.value = true
  await donorListStore.fetchDonors(paginationRequest)
  tableLoading.value = false
}

const onFilterUpdate = async (filter?: DonorListFilterRequest) => {
  donorListStore.updateFilter(filter)
  await fetchDonors({
    ...paginationRequest.value,
    page: 1,
  })
}

onMounted(async () => {
  await fetchDonors(paginationRequest.value)
  loading.value = false
})
</script>
