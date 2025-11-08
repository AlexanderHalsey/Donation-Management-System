<template>
  <Page title="Liste des dons" :breadcrumbs="breadcrumbs" :loading="loading">
    <template #actions>
      <Btn to="/donations/create" icon="add" color="secondary"> Nouveau don </Btn>
    </template>
    <DonationListTable
      :donationList="donationList"
      :pagination="pagination"
      :loading="tableLoading"
      @update:pagination="onPaginationUpdate"
    />
  </Page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

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

const loading = ref(true)
const tableLoading = ref(false)

const onPaginationUpdate = async (pagination: DonationListPaginationRequest) => {
  tableLoading.value = true
  await donationStore.fetchDonations(pagination)
  tableLoading.value = false
}

onMounted(async () => {
  await donationStore.fetchDonations()
  loading.value = false
})
</script>
