<template>
  <Page title="Liste des dons" :breadcrumbs="breadcrumbs" :loading="loading" :working="working">
    <template #actions>
      <Btn to="/donations/create" icon="add" color="primary" class="q-mr-sm"> Nouveau </Btn>
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
      @delete:donation="deleteDonation"
    />
  </Page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'

import { omit } from 'es-toolkit'

import Page from '@/layouts/Page.vue'
import Btn from '@/components/ui/Btn.vue'

import DonationListTable from '../components/DonationListTable.vue'
import DonationListFilter from '../components/DonationListFilter.vue'

import {
  useDonationListStore,
  useDonationStore,
  useDonationTypeListStore,
  useDonorListStore,
  useOrganisationListStore,
  usePaymentModeListStore,
} from '@/stores'

import type { Breadcrumb, LazySelectOptions } from '@/types'
import type {
  DonationListFilter as DonationListFilterRequest,
  DonationListPaginationRequest,
  DonationType,
  DonorRefSelect,
  PaymentMode,
} from '@shared/models'

const breadcrumbs: Breadcrumb[] = [
  { id: 'donation-list', label: 'Liste des dons', icon: 'volunteer_activism' },
]

const $q = useQuasar()

const donationListStore = useDonationListStore()
const donationStore = useDonationStore()
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
  load: async () => await donationTypeListStore.fetchDonationTypes(),
}))

const paymentModes = computed<LazySelectOptions<PaymentMode>>(() => ({
  options: paymentModeListStore.paymentModeList,
  load: async () => await paymentModeListStore.fetchPaymentModes(),
}))

const donors = computed<LazySelectOptions<DonorRefSelect>>(() => ({
  options: donorListStore.donorRefList,
  load: async () => await donorListStore.fetchDonorRefs(),
}))

const loading = ref(true)
const working = ref(false)
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

const deleteDonation = async (donationId: string) => {
  working.value = true
  await donationStore.deleteDonation(donationId)
  working.value = false
  $q.notify({ type: 'positive', message: 'Le don a été supprimé avec succès.' })
  // Refetch donations to update the list
  await fetchDonations(paginationRequest.value)
}

onMounted(async () => {
  await Promise.all([
    fetchDonations(paginationRequest.value),
    organisationListStore.fetchOrganisationRefs(),
  ])
  loading.value = false
})
</script>
