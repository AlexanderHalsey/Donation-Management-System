<template>
  <Page
    title="Liste des reçus fiscaux"
    :breadcrumbs="breadcrumbs"
    :loading="loading"
    :working="working"
  >
    <template #actions>
      <!-- todo add annual receipt btn -->
      <TaxReceiptListFilter
        :filter="filter"
        :donors="donors"
        data-cy="tax-receipt-list-filter"
        @update:filter="onFilterUpdate"
      />
    </template>
    <TaxReceiptListTable
      :taxReceiptList="taxReceiptList"
      :pagination="pagination"
      :loading="tableLoading"
      @update:pagination="fetchTaxReceipts"
      @cancel:taxReceipt="cancelTaxReceipt"
    />
  </Page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'

import { omit } from 'es-toolkit'

import Page from '@/layouts/Page.vue'

import TaxReceiptListTable from '../components/TaxReceiptListTable.vue'
import TaxReceiptListFilter from '../components/TaxReceiptListFilter.vue'

import { useDonorListStore, useTaxReceiptListStore, useTaxReceiptStore } from '@/stores'

import type { Breadcrumb, LazySelectOptions } from '@/types'
import type {
  DonorRefSelect,
  TaxReceiptListFilter as TaxReceiptListFilterRequest,
  TaxReceiptListPaginationRequest,
} from '@shared/models'
import type { CancelTaxReceiptFormData } from '../types'

const breadcrumbs: Breadcrumb[] = [
  { id: 'tax-receipt-list', label: 'Liste des reçus fiscaux', icon: 'receipt_long' },
]

const $q = useQuasar()

const taxReceiptListStore = useTaxReceiptListStore()
const taxReceiptStore = useTaxReceiptStore()
const donorListStore = useDonorListStore()

const taxReceiptList = computed(() => taxReceiptListStore.taxReceiptList)
const pagination = computed(() => taxReceiptListStore.pagination)
const paginationRequest = computed<TaxReceiptListPaginationRequest>(() =>
  omit(pagination.value, ['totalCount']),
)
const filter = computed(() => taxReceiptListStore.filter)

const donors = computed<LazySelectOptions<DonorRefSelect>>(() => ({
  options: donorListStore.donorRefList,
  load: async () => await donorListStore.fetchDonorRefs(),
}))

const loading = ref(true)
const working = ref(false)
const tableLoading = ref(false)

const fetchTaxReceipts = async (paginationRequest: TaxReceiptListPaginationRequest) => {
  tableLoading.value = true
  await taxReceiptListStore.fetchTaxReceipts(paginationRequest)
  tableLoading.value = false
}

const onFilterUpdate = async (filter?: TaxReceiptListFilterRequest) => {
  taxReceiptListStore.updateFilter(filter)
  await fetchTaxReceipts({
    ...paginationRequest.value,
    page: 1,
  })
}

const cancelTaxReceipt = async (formData: CancelTaxReceiptFormData) => {
  working.value = true
  await taxReceiptStore.cancel(formData)
  working.value = false
  $q.notify({ type: 'positive', message: 'Le reçu fiscal a été annulé avec succès.' })
  // Refetch tax receipts to update the list
  await fetchTaxReceipts(paginationRequest.value)
}

onMounted(async () => {
  await fetchTaxReceipts(paginationRequest.value)
  loading.value = false
})
</script>
