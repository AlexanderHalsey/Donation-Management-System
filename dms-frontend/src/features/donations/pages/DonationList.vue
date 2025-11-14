<template>
  <Page title="Liste des dons" :breadcrumbs="breadcrumbs" :loading="loading">
    <template #actions>
      <Btn to="/donations/create" icon="add" color="primary" class="q-mr-sm"> Nouveau don </Btn>
      <DonationListFilter
        :filter="filter"
        :organisations="organisations"
        :donationTypes="donationTypes"
        :paymentModes="paymentModes"
        :donors="donors"
        data-cy="donation-list-filter"
        @update:filter="onFilterUpdate"
      />
    </template>
    <DonationListTable
      :donationList="donationList"
      :pagination="pagination"
      :organisations="organisations"
      :loading="tableLoading"
      @update:pagination="fetchDonations"
    />
  </Page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { omit } from 'es-toolkit'

import Page from '@/layouts/Page.vue'
import Btn from '@/components/ui/Btn.vue'

import DonationListTable from '../components/DonationListTable.vue'
import DonationListFilter, { type LazySelectOptions } from '../components/DonationListFilter.vue'

import {
  useDonationListStore,
  useDonationTypeListStore,
  useDonorListStore,
  useOrganisationListStore,
  usePaymentModeListStore,
} from '@/stores'

import type { Breadcrumb } from '@/types'
import {
  type DonationListFilter as DonationListFilterRequest,
  type DonationListPaginationRequest,
  type DonationType,
  type DonorRef,
  type PaymentMode,
} from '@shared/models'

const breadcrumbs: Breadcrumb[] = [
  { id: 'donation-list', label: 'Liste des dons', icon: 'volunteer_activism' },
]

const donationListStore = useDonationListStore()
const organisationListStore = useOrganisationListStore()
const donationTypeListStore = useDonationTypeListStore()
const paymentModeListStore = usePaymentModeListStore()
const donorListStore = useDonorListStore()

const donationList = computed(() => donationListStore.donationList)
const pagination = computed(() => donationListStore.pagination)
const paginationRequest = computed<DonationListPaginationRequest>(() =>
  omit(pagination.value, ['totalCount']),
)
const filter = computed(() => donationListStore.filter)

const organisations = computed(() => organisationListStore.organisationRefList)

const donationTypes = computed<LazySelectOptions<DonationType>>(() => ({
  options: donationTypeListStore.donationTypeList,
  filterFn: async (_, update) => {
    if (!donationTypeListStore.initialized) {
      await donationTypeListStore.fetchDonationTypes()
    }
    update()
  },
}))

const paymentModes = computed<LazySelectOptions<PaymentMode>>(() => ({
  options: paymentModeListStore.paymentModeList,
  filterFn: async (_, update) => {
    if (!paymentModeListStore.initialized) {
      await paymentModeListStore.fetchPaymentModes()
    }
    update()
  },
}))

const donors = computed<LazySelectOptions<DonorRef>>(() => ({
  options: donorListStore.donorRefList,
  filterFn: async (_, update) => {
    if (!donorListStore.refsInitialized) {
      await donorListStore.fetchDonorRefs()
    }
    update()
  },
}))

const loading = ref(true)
const tableLoading = ref(false)

const fetchDonations = async (paginationRequest: DonationListPaginationRequest) => {
  tableLoading.value = true
  await donationListStore.fetchDonations(paginationRequest)
  tableLoading.value = false
}

const onFilterUpdate = async (filter?: DonationListFilterRequest) => {
  donationListStore.updateFilter(filter)
  await fetchDonations({
    ...paginationRequest.value,
    page: 1,
  })
}

onMounted(async () => {
  await Promise.all([
    fetchDonations(paginationRequest.value),
    organisationListStore.refsInitialized
      ? Promise.resolve()
      : organisationListStore.fetchOrganisationRefs(),
  ])
  loading.value = false
})
</script>
