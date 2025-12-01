<template>
  <Page title="Nouvelle forme de don" :breadcrumbs="breadcrumbs" :working="working">
    <template #actions>
      <Btn
        color="primary"
        icon="add"
        @click="donationMethodForm?.validate()"
        data-cy="create-donation-method"
      >
        Créer
      </Btn>
    </template>
    <DonationMethodForm
      ref="donationMethodForm"
      data-cy="donation-method-form"
      @submit="createDonationMethod"
    />
  </Page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

import Page from '@/layouts/Page.vue'
import Btn from '@/components/ui/Btn.vue'
import DonationMethodForm from '../components/DonationMethodForm.vue'

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
  { id: 'donation-method-create', label: 'Nouvelle forme de don', icon: 'add' },
]

const $q = useQuasar()
const router = useRouter()

const donationMethodStore = useDonationMethodStore()

const donationMethodForm = ref<InstanceType<typeof DonationMethodForm> | null>(null)

const createDonationMethod = async (formData: DonationMethodFormData) => {
  working.value = true
  await donationMethodStore.createDonationMethod(formData)
  working.value = false
  $q.notify({ type: 'positive', message: 'La forme de don a été créée avec succès.' })
  await router.push({ name: 'donation-methods' })
}

const working = ref(false)
</script>
