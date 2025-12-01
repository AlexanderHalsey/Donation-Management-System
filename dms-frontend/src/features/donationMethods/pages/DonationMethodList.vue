<template>
  <Page title="Liste des formes de don" :breadcrumbs="breadcrumbs" :loading="loading">
    <template #actions>
      <Btn to="/donation-methods/create" icon="add" color="primary" class="q-mr-sm"> Nouveau </Btn>
    </template>
    <DonationMethodListTable
      :donation-method-list="donationMethodList"
      @delete:donation-method="deleteDonationMethod"
    />
  </Page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'

import Page from '@/layouts/Page.vue'
import Btn from '@/components/ui/Btn.vue'

import DonationMethodListTable from '../components/DonationMethodListTable.vue'

import { useDonationMethodListStore, useDonationMethodStore } from '@/stores'

import type { Breadcrumb } from '@/types'

const breadcrumbs: Breadcrumb[] = [
  {
    id: 'donation-method-list',
    label: 'Liste des formes de don',
    icon: 'shape_line',
  },
]

const $q = useQuasar()

const donationMethodListStore = useDonationMethodListStore()
const donationMethodStore = useDonationMethodStore()

const donationMethodList = computed(() => donationMethodListStore.donationMethodList)

const loading = ref(true)
const working = ref(false)

const deleteDonationMethod = async (donationMethodId: string) => {
  working.value = true
  await donationMethodStore.deleteDonationMethod(donationMethodId)
  working.value = false
  $q.notify({ type: 'positive', message: 'La forme de don a été supprimée avec succès.' })
}

onMounted(async () => {
  await donationMethodListStore.fetchDonationMethods()
  loading.value = false
})
</script>
