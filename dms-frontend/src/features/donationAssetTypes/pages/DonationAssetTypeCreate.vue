<template>
  <Page title="Nouveau nature du don" :breadcrumbs="breadcrumbs" :working="working">
    <template #actions>
      <Btn
        color="primary"
        icon="add"
        @click="donationAssetTypeForm?.validate()"
        data-cy="create-donation-asset-type"
      >
        Créer
      </Btn>
    </template>
    <DonationAssetTypeForm
      ref="donationAssetTypeForm"
      data-cy="donation-asset-type-form"
      @submit="createDonationAssetType"
    />
  </Page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

import Page from '@/layouts/Page.vue'
import Btn from '@/components/ui/Btn.vue'
import DonationAssetTypeForm from '../components/DonationAssetTypeForm.vue'

import { useDonationAssetTypeStore } from '@/stores'

import type { DonationAssetTypeFormData } from '../types'

import type { Breadcrumb } from '@/types'

const breadcrumbs: Breadcrumb[] = [
  {
    id: 'donation-asset-type-list',
    label: 'Liste des natures de dons',
    to: '/donation-asset-types',
    icon: 'category',
  },
  { id: 'donation-asset-type-create', label: 'Nouvelle nature de don', icon: 'add' },
]

const $q = useQuasar()
const router = useRouter()

const donationAssetTypeStore = useDonationAssetTypeStore()

const donationAssetTypeForm = ref<InstanceType<typeof DonationAssetTypeForm> | null>(null)

const createDonationAssetType = async (formData: DonationAssetTypeFormData) => {
  working.value = true
  await donationAssetTypeStore.createDonationAssetType(formData)
  working.value = false
  $q.notify({ type: 'positive', message: 'La nature du don a été créée avec succès.' })
  await router.push({ name: 'donation-asset-types' })
}

const working = ref(false)
</script>
