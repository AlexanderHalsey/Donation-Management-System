<template>
  <Page title="Liste des natures de dons" :breadcrumbs="breadcrumbs" :loading="loading">
    <template #actions>
      <Btn to="/donation-asset-types/create" icon="add" color="primary" class="q-mr-sm">
        Nouveau
      </Btn>
    </template>
    <DonationAssetTypeListTable
      :donation-asset-type-list="donationAssetTypeList"
      @delete:donation-asset-type="deleteDonationAssetType"
    />
  </Page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'

import Page from '@/layouts/Page.vue'
import Btn from '@/components/ui/Btn.vue'

import DonationAssetTypeListTable from '../components/DonationAssetTypeListTable.vue'

import { useDonationAssetTypeListStore, useDonationAssetTypeStore } from '@/stores'

import type { Breadcrumb } from '@/types'

const breadcrumbs: Breadcrumb[] = [
  {
    id: 'donation-asset-type-list',
    label: 'Liste des natures de dons',
    icon: 'category',
  },
]

const $q = useQuasar()

const donationAssetTypeListStore = useDonationAssetTypeListStore()
const donationAssetTypeStore = useDonationAssetTypeStore()

const donationAssetTypeList = computed(() => donationAssetTypeListStore.activeDonationAssetTypeList)

const loading = ref(true)
const working = ref(false)

const deleteDonationAssetType = async (donationAssetTypeId: string) => {
  working.value = true
  await donationAssetTypeStore.deleteDonationAssetType(donationAssetTypeId)
  working.value = false
  $q.notify({ type: 'positive', message: 'La nature du don a été supprimée avec succès.' })
}

onMounted(async () => {
  await donationAssetTypeListStore.fetchDonationAssetTypes()
  loading.value = false
})
</script>
