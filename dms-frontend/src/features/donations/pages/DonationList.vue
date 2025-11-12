<template>
  <Page title="Liste des dons" :breadcrumbs="breadcrumbs" :loading="loading">
    <template #actions>
      <Btn to="/donations/create" icon="add" color="primary" class="q-mr-sm"> Nouveau don </Btn>
    </template>
    <DonationListTable
      :donationList="donationList"
      :pagination="pagination"
      :organisations="donationListContext.organisations"
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

import { useDonationStore } from '@/stores'

import type { Breadcrumb } from '@/types'
import type { DonationListPaginationRequest } from '@shared/models'

const breadcrumbs: Breadcrumb[] = [
  { id: 'donation-list', label: 'Liste des dons', icon: 'volunteer_activism' },
]

const donationStore = useDonationStore()

const donationList = computed(() => donationStore.donationList)
const pagination = computed(() => donationStore.pagination)
const paginationRequest = computed<DonationListPaginationRequest>(() =>
  omit(pagination.value, ['totalCount']),
)
const donationListContext = computed(() => donationStore.context)

const loading = ref(true)
const tableLoading = ref(false)

const fetchDonations = async (paginationRequest: DonationListPaginationRequest) => {
  tableLoading.value = true
  await donationStore.fetchDonations(paginationRequest)
  tableLoading.value = false
}

onMounted(async () => {
  await Promise.all([fetchDonations(paginationRequest.value), donationStore.fetchContext()])
  loading.value = false
})
</script>
