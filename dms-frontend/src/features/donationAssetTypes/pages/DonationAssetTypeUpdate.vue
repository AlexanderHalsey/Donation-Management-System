<template>
  <Page title="Modifier la nature du don" :breadcrumbs="breadcrumbs" :loading="loading">
    <template #actions>
      <Btn
        outline
        icon="delete"
        class="text-red-8 q-mr-md"
        data-cy="delete-donation-asset-type"
        @click="deleteDonationAssetTypeDialog?.open()"
      >
        Supprimer
      </Btn>
      <Btn
        color="primary"
        icon="edit"
        data-cy="update-donation-asset-type"
        @click="donationAssetTypeForm?.validate()"
      >
        Mettre à jour
      </Btn>
    </template>
    <DonationAssetTypeForm
      ref="donationAssetTypeForm"
      :donationAssetType="donationAssetType"
      @submit="updateDonationAssetType"
    />
    <DeleteDonationAssetTypeDialog
      ref="deleteDonationAssetTypeDialog"
      @delete:donationAssetType="deleteDonationAssetType"
    />
  </Page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

import { AxiosError } from 'axios'

import Page from '@/layouts/Page.vue'
import Btn from '@/components/ui/Btn.vue'

import DonationAssetTypeForm from '../components/DonationAssetTypeForm.vue'
import DeleteDonationAssetTypeDialog from '../components/DeleteDonationAssetTypeDialog.vue'

import { useDonationAssetTypeStore } from '@/stores'

import type { DonationAssetTypeFormData } from '../types'
import type { Breadcrumb } from '@/types'

const breadcrumbs: Breadcrumb[] = [
  {
    id: 'donation-asset-type-list',
    label: 'Liste des natures de don',
    to: '/donation-asset-types',
    icon: 'category',
  },
  { id: 'donation-asset-type-update', label: 'Modifier la nature du don', icon: 'edit' },
]

const donationAssetTypeStore = useDonationAssetTypeStore()

const router = useRouter()
const route = useRoute()
const $q = useQuasar()

const donationAssetTypeId = computed(() => route.params.id as string)
const donationAssetType = computed(() => donationAssetTypeStore.donationAssetType)

const donationAssetTypeForm = ref<InstanceType<typeof DonationAssetTypeForm> | null>(null)
const deleteDonationAssetTypeDialog = ref<InstanceType<
  typeof DeleteDonationAssetTypeDialog
> | null>(null)

const updateDonationAssetType = async (formData: DonationAssetTypeFormData) => {
  working.value = true
  try {
    await donationAssetTypeStore.updateDonationAssetType(donationAssetTypeId.value, formData)
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response?.status === 409) {
      $q.notify({
        type: 'negative',
        message: 'Une nature de don avec ce nom existe déjà. Veuillez en choisir une autre.',
      })
    }
    working.value = false
    throw error
  }
  working.value = false
  $q.notify({ type: 'positive', message: 'La nature du don a été mise à jour avec succès.' })
  await router.push({ name: 'donation-asset-types' })
}

const deleteDonationAssetType = async () => {
  working.value = true
  await donationAssetTypeStore.deleteDonationAssetType(donationAssetTypeId.value)
  working.value = false
  $q.notify({ type: 'positive', message: 'La nature du don a été supprimée avec succès.' })
  await router.push({ name: 'donation-asset-types' })
}

const loading = ref(true)
const working = ref(false)
onMounted(async () => {
  await donationAssetTypeStore.fetchDonationAssetType(donationAssetTypeId.value)
  loading.value = false
})
</script>
