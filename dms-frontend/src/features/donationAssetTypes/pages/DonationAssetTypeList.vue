<template>
  <Page :title="t('labels.listOfDonationAssetTypes')" :breadcrumbs="breadcrumbs" :loading="loading">
    <template #actions>
      <Btn to="/donation-asset-types/create" icon="add" color="primary" class="q-mr-sm">
        {{ t('actions.new') }}
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
import { useI18n } from '@/composables'
import { useQuasar } from 'quasar'

import Page from '@/layouts/Page.vue'
import Btn from '@/components/ui/Btn.vue'

import DonationAssetTypeListTable from '../components/DonationAssetTypeListTable.vue'

import { useDonationAssetTypeListStore, useDonationAssetTypeStore } from '@/stores'

import type { Breadcrumb } from '@/types'

const { t } = useI18n()

const breadcrumbs: Breadcrumb[] = [
  {
    id: 'donation-asset-type-list',
    label: t('labels.listOfDonationAssetTypes'),
    icon: 'payments',
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
  $q.notify({ type: 'positive', message: t('notifications.donationAssetTypeDeleted') })
}

onMounted(async () => {
  await donationAssetTypeListStore.fetchDonationAssetTypes()
  loading.value = false
})
</script>
