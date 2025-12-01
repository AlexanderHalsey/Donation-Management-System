<template>
  <Page title="Modifier la forme de don" :breadcrumbs="breadcrumbs" :loading="loading">
    <template #actions>
      <Btn
        outline
        icon="delete"
        class="text-red-8 q-mr-md"
        data-cy="delete-donation-method"
        @click="deleteDonationMethodDialog?.open()"
      >
        Supprimer
      </Btn>
      <Btn
        color="primary"
        icon="edit"
        data-cy="update-donation-method"
        @click="donationMethodForm?.validate()"
      >
        Mettre à jour
      </Btn>
    </template>
    <DonationMethodForm
      ref="donationMethodForm"
      :donationMethod="donationMethod"
      @submit="updateDonationMethod"
    />
    <DeleteDonationMethodDialog
      ref="deleteDonationMethodDialog"
      @delete:donationMethod="deleteDonationMethod"
    />
  </Page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

import Page from '@/layouts/Page.vue'
import Btn from '@/components/ui/Btn.vue'

import DonationMethodForm from '../components/DonationMethodForm.vue'
import DeleteDonationMethodDialog from '../components/DeleteDonationMethodDialog.vue'

import { useDonationMethodStore } from '@/stores'

import type { DonationMethodFormData } from '../types'
import type { Breadcrumb } from '@/types'

const breadcrumbs: Breadcrumb[] = [
  {
    id: 'donation-method-list',
    label: 'Liste des formes de don',
    to: '/donation-methods',
    icon: 'shape_line',
  },
  { id: 'donation-method-update', label: 'Modifier la forme de don', icon: 'edit' },
]

const donationMethodStore = useDonationMethodStore()

const router = useRouter()
const route = useRoute()
const $q = useQuasar()

const donationMethodId = computed(() => route.params.id as string)
const donationMethod = computed(() => donationMethodStore.donationMethod)

const donationMethodForm = ref<InstanceType<typeof DonationMethodForm> | null>(null)
const deleteDonationMethodDialog = ref<InstanceType<typeof DeleteDonationMethodDialog> | null>(null)

const updateDonationMethod = async (formData: DonationMethodFormData) => {
  working.value = true
  await donationMethodStore.updateDonationMethod(donationMethodId.value, formData)
  working.value = false
  $q.notify({ type: 'positive', message: 'La forme de don a été mise à jour avec succès.' })
  await router.push({ name: 'donation-methods' })
}

const deleteDonationMethod = async () => {
  working.value = true
  await donationMethodStore.deleteDonationMethod(donationMethodId.value)
  working.value = false
  $q.notify({ type: 'positive', message: 'La forme de don a été supprimée avec succès.' })
  await router.push({ name: 'donation-methods' })
}

const loading = ref(true)
const working = ref(false)
onMounted(async () => {
  await donationMethodStore.fetchDonationMethod(donationMethodId.value)
  loading.value = false
})
</script>
