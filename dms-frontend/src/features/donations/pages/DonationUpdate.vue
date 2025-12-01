<template>
  <Page title="Modifier le don" :breadcrumbs="breadcrumbs" :loading="loading">
    <template #actions>
      <Btn
        outline
        icon="delete"
        class="text-red-8 q-mr-md"
        data-cy="delete-donation"
        @click="deleteDonationDialog?.open()"
      >
        Supprimer
      </Btn>
      <Btn color="primary" icon="edit" data-cy="update-donation" @click="donationForm?.validate()">
        Mettre à jour
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
      :donation="donation"
      @submit="updateDonation"
    />
    <DeleteDonationDialog ref="deleteDonationDialog" @delete:donation="deleteDonation" />
  </Page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

import Page from '@/layouts/Page.vue'
import Btn from '@/components/ui/Btn.vue'

import DonationForm from '../components/DonationForm.vue'
import DeleteDonationDialog from '../components/DeleteDonationDialog.vue'

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
  { id: 'donation-update', label: 'Modifier le don', icon: 'edit' },
]

const donationStore = useDonationStore()
const donorListStore = useDonorListStore()
const organisationListStore = useOrganisationListStore()
const donationTypeListStore = useDonationTypeListStore()
const paymentModeListStore = usePaymentModeListStore()
const donationAssetTypeListStore = useDonationAssetTypeListStore()
const donationMethodListStore = useDonationMethodListStore()

const router = useRouter()
const route = useRoute()
const $q = useQuasar()

const donationId = computed(() => route.params.id as string)
const donation = computed(() => donationStore.donation)
const donors = computed(() => donorListStore.activeDonorRefList)
const organisations = computed(() => organisationListStore.organisationRefList)
const donationTypes = computed(() => donationTypeListStore.donationTypeList)
const paymentModes = computed(() => paymentModeListStore.paymentModeList)
const donationAssetTypes = computed(() => donationAssetTypeListStore.activeDonationAssetTypeList)
const donationMethods = computed(() => donationMethodListStore.activeDonationMethodList)

const donationForm = ref<InstanceType<typeof DonationForm> | null>(null)
const deleteDonationDialog = ref<InstanceType<typeof DeleteDonationDialog> | null>(null)

const updateDonation = async (formData: DonationFormData) => {
  working.value = true
  await donationStore.updateDonation(donationId.value, formData)
  working.value = false
  $q.notify({ type: 'positive', message: 'Le don a été mis à jour avec succès.' })
  await router.push({ name: 'donations' })
}

const deleteDonation = async () => {
  working.value = true
  await donationStore.deleteDonation(donationId.value)
  working.value = false
  $q.notify({ type: 'positive', message: 'Le don a été supprimé avec succès.' })
  await router.push({ name: 'donations' })
}

const loading = ref(true)
const working = ref(false)
onMounted(async () => {
  await Promise.all([
    donationStore.fetchDonation(donationId.value),
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
