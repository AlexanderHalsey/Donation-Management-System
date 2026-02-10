<template>
  <Page :title="t('labels.listOfDonationMethods')" :breadcrumbs="breadcrumbs" :loading="loading">
    <template #actions>
      <Btn to="/donation-methods/create" icon="add" color="primary" class="q-mr-sm">
        {{ t('actions.new') }}
      </Btn>
    </template>
    <DonationMethodListTable
      :donation-method-list="donationMethodList"
      @delete:donation-method="deleteDonationMethod"
    />
  </Page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from '@/composables'
import { useQuasar } from 'quasar'

import Page from '@/layouts/Page.vue'
import Btn from '@/components/ui/Btn.vue'

import DonationMethodListTable from '../components/DonationMethodListTable.vue'

import { useDonationMethodListStore, useDonationMethodStore } from '@/stores'

import type { Breadcrumb } from '@/types'

const { t } = useI18n()

const breadcrumbs: Breadcrumb[] = [
  {
    id: 'donation-method-list',
    label: t('labels.listOfDonationMethods'),
    icon: 'article',
  },
]

const $q = useQuasar()

const donationMethodListStore = useDonationMethodListStore()
const donationMethodStore = useDonationMethodStore()

const donationMethodList = computed(() => donationMethodListStore.activeDonationMethodList)

const loading = ref(true)
const working = ref(false)

const deleteDonationMethod = async (donationMethodId: string) => {
  working.value = true
  await donationMethodStore.deleteDonationMethod(donationMethodId)
  working.value = false
  $q.notify({ type: 'positive', message: t('notifications.donationMethodDeleted') })
}

onMounted(async () => {
  await donationMethodListStore.fetchDonationMethods()
  loading.value = false
})
</script>
