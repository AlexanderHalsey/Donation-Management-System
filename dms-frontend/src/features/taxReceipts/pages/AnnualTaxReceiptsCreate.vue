<template>
  <Page
    title="Création des reçus fiscaux annuels"
    :breadcrumbs="breadcrumbs"
    :loading="loading"
    :working="working"
  >
    <template #actions>
      <Btn
        color="primary"
        icon="add"
        @click="annualTaxReceiptsForm?.validate()"
        data-cy="create-annual-tax-receipts-button"
      >
        Créer
      </Btn>
    </template>
    <div class="flex q-mb-md q-gutter-xl" data-cy="annual-tax-receipts-create-titles">
      <div class="text-bold">Année : {{ year }}</div>
      <div class="text-bold">Organisation : {{ organisation?.name }}</div>
      <div v-if="formErrorMessage" class="col-grow text-right" data-cy="form-error-message">
        <div class="text-negative">{{ formErrorMessage }}</div>
      </div>
    </div>
    <AnnualTaxReceiptsForm
      ref="annualTaxReceiptsForm"
      :eligibleDonors="eligibleDonors"
      :organisations="organisationRefs"
      :loading="working"
      data-cy="annual-tax-receipts-form"
      @submit="createAnnualTaxReceipts"
    />
  </Page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

import Page from '@/layouts/Page.vue'
import Btn from '@/components/ui/Btn.vue'
import AnnualTaxReceiptsForm from '../components/AnnualTaxReceiptsForm.vue'

import { useAnnualTaxReceiptsStore, useOrganisationListStore } from '@/stores'

import type { AnnualTaxReceiptsFormData } from '../types'
import type { Breadcrumb } from '@/types'

const breadcrumbs: Breadcrumb[] = [
  {
    id: 'tax-receipt-list',
    label: 'Liste des reçus fiscaux',
    icon: 'receipt_long',
    to: '/tax-receipts',
  },
  { id: 'annual-tax-receipts-create', label: 'Création des reçus fiscaux annuels', icon: 'add' },
]

const $q = useQuasar()
const router = useRouter()
const route = useRoute()

const organisationListStore = useOrganisationListStore()
const annualTaxReceiptsStore = useAnnualTaxReceiptsStore()

const organisationId = computed(() => route.params.organisationId as string)
const year = computed(() => parseInt(route.params.year as string, 10))

const organisationRefs = computed(() => organisationListStore.organisationRefList)
const organisation = computed(() =>
  organisationRefs.value.find((org) => org.id === organisationId.value),
)
const eligibleDonors = computed(() => annualTaxReceiptsStore.eligibleTaxReceiptDonors)
const annualTaxReceiptsForm = ref<InstanceType<typeof AnnualTaxReceiptsForm> | null>(null)
const formErrorMessage = computed(() => annualTaxReceiptsForm.value?.errorMessage)
const loading = ref(true)
const working = ref(false)

const createAnnualTaxReceipts = async (formData: AnnualTaxReceiptsFormData) => {
  working.value = true
  await annualTaxReceiptsStore.createAnnualTaxReceipts({
    year: year.value,
    organisationId: organisationId.value,
    formData,
  })
  working.value = false
  $q.notify({
    type: 'positive',
    message:
      'Les reçus fiscaux annuels sont en cours de création. Des emails seront envoyés une fois le processus terminé.',
  })
  await router.push({ name: 'tax-receipts' })
}

onMounted(async () => {
  await Promise.all([
    annualTaxReceiptsStore.fetchEligibleTaxReceiptDonors({
      year: year.value,
      organisationId: organisationId.value,
    }),
    organisationListStore.fetchOrganisationRefs(),
  ])
  loading.value = false
})
</script>
