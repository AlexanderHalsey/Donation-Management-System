<template>
  <Page title="Nouveau mode de paiement" :breadcrumbs="breadcrumbs" :working="working">
    <template #actions>
      <Btn
        color="primary"
        icon="add"
        @click="paymentModeForm?.validate()"
        data-cy="create-payment-mode"
      >
        Créer
      </Btn>
    </template>
    <PaymentModeForm
      ref="paymentModeForm"
      data-cy="payment-mode-form"
      @submit="createPaymentMode"
    />
  </Page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

import Page from '@/layouts/Page.vue'
import Btn from '@/components/ui/Btn.vue'
import PaymentModeForm from '../components/PaymentModeForm.vue'

import { usePaymentModeStore } from '@/stores'

import type { PaymentModeFormData } from '../types'

import type { Breadcrumb } from '@/types'

const breadcrumbs: Breadcrumb[] = [
  {
    id: 'payment-mode-list',
    label: 'Liste des modes de paiement',
    to: '/payment-modes',
    icon: 'point_of_sale',
  },
  { id: 'payment-mode-create', label: 'Nouveau mode de paiement', icon: 'add' },
]

const $q = useQuasar()
const router = useRouter()

const paymentModeStore = usePaymentModeStore()

const paymentModeForm = ref<InstanceType<typeof PaymentModeForm> | null>(null)

const createPaymentMode = async (formData: PaymentModeFormData) => {
  working.value = true
  await paymentModeStore.createPaymentMode(formData)
  working.value = false
  $q.notify({ type: 'positive', message: 'Le mode de paiement a été créé avec succès.' })
  await router.push({ name: 'payment-modes' })
}

const working = ref(false)
</script>
