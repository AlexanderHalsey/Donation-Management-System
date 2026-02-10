<template>
  <Page :title="t('labels.listOfDonors')" :breadcrumbs="breadcrumbs" :loading="loading">
    <template #actions>
      <BtnGroup outline>
        <DonorListFilter
          :filter="filter"
          :donor-refs="donorRefs"
          data-cy="donor-list-filter"
          @update:filter="onFilterUpdate"
        />
        <ListExportButton @export-csv="exportCsv" @export-xlsx="exportXlsx" />
      </BtnGroup>
    </template>
    <div class="row justify-center">
      <DonorListTable
        :donor-list="donorList"
        :pagination="pagination"
        :loading="tableLoading"
        data-cy="donor-list-table"
        style="width: 90%"
        @update:pagination="fetchDonors"
      />
    </div>
  </Page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from '@/composables'

import { omit } from 'es-toolkit'

import Page from '@/layouts/Page.vue'
import BtnGroup from '@/components/ui/BtnGroup.vue'

import ListExportButton from '@/components/ListExportButton.vue'

import DonorListTable from '../components/DonorListTable.vue'
import DonorListFilter from '../components/DonorListFilter.vue'

import { useDonorListStore } from '@/stores'

import type { Breadcrumb, LazySelectOptions } from '@/types'
import type {
  DonorListFilter as DonorListFilterRequest,
  DonorListPaginationRequest,
  DonorRefSelect,
} from '@shared/models'

const { t } = useI18n()

const breadcrumbs: Breadcrumb[] = [
  { id: 'donor-list', label: t('labels.listOfDonors'), icon: 'group' },
]

const donorListStore = useDonorListStore()

const donorList = computed(() => donorListStore.donorList)
const pagination = computed(() => donorListStore.pagination)
const paginationRequest = computed<DonorListPaginationRequest>(() =>
  omit(pagination.value, ['totalCount']),
)
const filter = computed(() => donorListStore.filter)

const donorRefs = computed<LazySelectOptions<DonorRefSelect>>(() => ({
  options: donorListStore.donorRefList,
  load: async () => await donorListStore.fetchDonorRefs(),
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

const exportCsv = async () => {
  await donorListStore.exportCsv()
}

const exportXlsx = async () => {
  await donorListStore.exportXlsx()
}

onMounted(async () => {
  await fetchDonors(paginationRequest.value)
  loading.value = false
})
</script>
