<template>
  <Page title="Nouveau don" :breadcrumbs="breadcrumbs" :loading="loading" :working="working">
    <template #actions>
      <Btn color="primary" icon="add" @click="donationForm?.validate()" data-cy="create-donation">
        Créer le don
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

const breadcrumbs: Breadcrumb[] = [
  { id: 'donation-list', label: 'Liste des dons', to: '/donations', icon: 'volunteer_activism' },
  { id: 'donation-create', label: 'Nouveau don', icon: 'add' },
]

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
const organisations = computed(() => organisationListStore.organisationRefList)
const donationTypes = computed(() => donationTypeListStore.donationTypeList)
const paymentModes = computed(() => paymentModeListStore.paymentModeList)
const donationAssetTypes = computed(() => donationAssetTypeListStore.donationAssetTypeList)
const donationMethods = computed(() => donationMethodListStore.donationMethodList)

const donationForm = ref<InstanceType<typeof DonationForm> | null>(null)

const createDonation = async (formData: DonationFormData) => {
  working.value = true
  await donationStore.createDonation(formData)
  working.value = false
  $q.notify({ type: 'positive', message: 'Le don a été créé avec succès.' })
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
