<template>
  <Page
    :title="`${t('labels.newDonation')}`"
    :breadcrumbs="breadcrumbs"
    :loading="loading"
    :working="working"
  >
    <template #actions>
      <Btn color="primary" icon="add" @click="donationForm?.validate()" data-cy="create-donation">
        {{ t('actions.create') }}
      </Btn>
    </template>
    <DonationForm
      ref="donationForm"
      :donorOptions="donors"
      :organisationOptions="organisations"
      :donationTypeOptions="donationTypes"
      :paymentModeOptions="paymentModes"
      :donationAssetTypeOptions="donationAssetTypes"
      :donationMethodOptions="donationMethods"
      data-cy="donation-form"
      @submit="createDonation"
    />
  </Page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from '@/composables'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

import Page from '@/layouts/Page.vue'
import Btn from '@/components/ui/Btn.vue'
import DonationForm from '../components/DonationForm.vue'

import {
  useDonationAssetTypeListStore,
  useDonationMethodListStore,
  useDonationStore,
  useDonationTypeListStore,
  useDonorListStore,
  useOrganisationListStore,
  usePaymentModeListStore,
} from '@/stores'

import type { DonationFormData } from '@/features/donations/types'

import type { Breadcrumb } from '@/types'

const { t } = useI18n()

const breadcrumbs = computed<Breadcrumb[]>(() => [
  {
    id: 'donation-list',
    label: t('labels.listOfDonations'),
    to: '/donations',
    icon: 'volunteer_activism',
  },
  {
    id: 'donation-create',
    label: t('labels.newDonation'),
    icon: 'add',
  },
])

const $q = useQuasar()
const router = useRouter()

const donationStore = useDonationStore()
const donorListStore = useDonorListStore()
const organisationListStore = useOrganisationListStore()
const donationTypeListStore = useDonationTypeListStore()
const paymentModeListStore = usePaymentModeListStore()
const donationAssetTypeListStore = useDonationAssetTypeListStore()
const donationMethodListStore = useDonationMethodListStore()

const donors = computed(() => donorListStore.activeDonorRefList)
const organisations = computed(() => organisationListStore.activeOrganisationRefList)
const donationTypes = computed(() => donationTypeListStore.donationTypeList)
const paymentModes = computed(() => paymentModeListStore.paymentModeList)
const donationAssetTypes = computed(() => donationAssetTypeListStore.activeDonationAssetTypeList)
const donationMethods = computed(() => donationMethodListStore.activeDonationMethodList)

const donationForm = ref<InstanceType<typeof DonationForm> | null>(null)

const createDonation = async (formData: DonationFormData) => {
  working.value = true
  try {
    await donationStore.createDonation(formData)
  } finally {
    working.value = false
  }
  $q.notify({ type: 'positive', message: t('notifications.donationCreated') })
  await router.push({ name: 'donations' })
}

const loading = ref(true)
const working = ref(false)
onMounted(async () => {
  await Promise.all([
    donorListStore.fetchDonorRefs(),
    organisationListStore.fetchOrganisationRefs(),
    donationTypeListStore.fetchDonationTypes(),
    paymentModeListStore.fetchPaymentModes(),
    donationAssetTypeListStore.fetchDonationAssetTypes(),
    donationMethodListStore.fetchDonationMethods(),
  ])
  loading.value = false
})
</script>
