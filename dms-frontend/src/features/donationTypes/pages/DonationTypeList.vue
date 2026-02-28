<template>
  <Page :title="t('labels.listOfDonationTypes')" :breadcrumbs="breadcrumbs" :loading="loading">
    <template #actions>
      <Btn to="/donation-types/create" icon="add" color="primary" class="q-mr-sm">
        {{ t('actions.create') }}
      </Btn>
    </template>
    <DonationTypeListTable
      :donation-type-list="donationTypeList"
      :organisation-options="organisations"
      @delete:donation-type="deleteDonationType"
    />
  </Page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from '@/composables'
import { useQuasar } from 'quasar'

import Page from '@/layouts/Page.vue'
import Btn from '@/components/ui/Btn.vue'

import DonationTypeListTable from '../components/DonationTypeListTable.vue'

import { useDonationTypeListStore, useDonationTypeStore, useOrganisationListStore } from '@/stores'

import type { Breadcrumb } from '@/types'

const { t } = useI18n()

const breadcrumbs = computed<Breadcrumb[]>(() => [
  {
    id: 'donation-type-list',
    label: t('labels.listOfDonationTypes'),
    icon: 'favorite',
  },
])

const $q = useQuasar()

const donationTypeListStore = useDonationTypeListStore()
const donationTypeStore = useDonationTypeStore()
const organisationListStore = useOrganisationListStore()

const donationTypeList = computed(() => donationTypeListStore.activeDonationTypeList)
const organisations = computed(() => organisationListStore.organisationRefList)

const loading = ref(true)
const working = ref(false)

const deleteDonationType = async (donationTypeId: string) => {
  working.value = true
  try {
    await donationTypeStore.deleteDonationType(donationTypeId)
  } finally {
    working.value = false
  }
  $q.notify({ type: 'positive', message: t('notifications.donationTypeDeleted') })
}

onMounted(async () => {
  await Promise.all([
    donationTypeListStore.fetchDonationTypes(),
    organisationListStore.fetchOrganisationRefs(),
  ])
  loading.value = false
})
</script>
