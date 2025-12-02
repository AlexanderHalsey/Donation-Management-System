<template>
  <Page title="Nouveau type de don" :breadcrumbs="breadcrumbs" :working="working">
    <template #actions>
      <Btn
        color="primary"
        icon="add"
        @click="donationTypeForm?.validate()"
        data-cy="create-donation-type"
      >
        Créer
      </Btn>
    </template>
    <DonationTypeForm
      ref="donationTypeForm"
      :organisation-options="organisations"
      data-cy="donation-type-form"
      @submit="createDonationType"
    />
  </Page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

import { AxiosError } from 'axios'

import Page from '@/layouts/Page.vue'
import Btn from '@/components/ui/Btn.vue'
import DonationTypeForm from '../components/DonationTypeForm.vue'

import { useDonationTypeStore, useOrganisationListStore } from '@/stores'

import type { DonationTypeFormData } from '../types'
import type { Breadcrumb } from '@/types'

const breadcrumbs: Breadcrumb[] = [
  {
    id: 'donation-type-list',
    label: 'Liste des types de don',
    to: '/donation-types',
    icon: 'volunteer_activism',
  },
  { id: 'donation-type-create', label: 'Nouveau type de don', icon: 'add' },
]

const $q = useQuasar()
const router = useRouter()

const donationTypeStore = useDonationTypeStore()
const organisationListStore = useOrganisationListStore()

const donationTypeForm = ref<InstanceType<typeof DonationTypeForm> | null>(null)
const working = ref(false)

const organisations = computed(() => organisationListStore.organisationRefList)

const createDonationType = async (formData: DonationTypeFormData) => {
  working.value = true
  try {
    await donationTypeStore.createDonationType(formData)
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response?.status === 409) {
      $q.notify({
        type: 'negative',
        message: 'Un type de don avec ce nom existe déjà. Veuillez en choisir un autre.',
      })
    }
    working.value = false
    throw error
  }
  working.value = false
  $q.notify({ type: 'positive', message: 'Le type de don a été créé avec succès.' })
  await router.push({ name: 'donation-types' })
}

onMounted(async () => {
  await organisationListStore.fetchOrganisationRefs()
})
</script>
