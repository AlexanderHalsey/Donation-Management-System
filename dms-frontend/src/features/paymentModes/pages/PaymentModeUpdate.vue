<template>
  <Page title="Modifier le mode de paiement" :breadcrumbs="breadcrumbs" :loading="loading">
    <template #actions>
      <Btn
        outline
        icon="delete"
        class="text-red-8 q-mr-md"
        data-cy="delete-payment-mode"
        @click="deletePaymentModeDialog?.open()"
      >
        Supprimer
      </Btn>
      <Btn
        color="primary"
        icon="edit"
        data-cy="update-payment-mode"
        @click="paymentModeForm?.validate()"
      >
        Mettre à jour
      </Btn>
    </template>
    <PaymentModeForm ref="paymentModeForm" :paymentMode="paymentMode" @submit="updatePaymentMode" />
    <DeletePaymentModeDialog
      ref="deletePaymentModeDialog"
      @delete:paymentMode="deletePaymentMode"
    />
  </Page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

import Page from '@/layouts/Page.vue'
import Btn from '@/components/ui/Btn.vue'

import PaymentModeForm from '../components/PaymentModeForm.vue'
import DeletePaymentModeDialog from '../components/DeletePaymentModeDialog.vue'

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
  { id: 'payment-mode-update', label: 'Modifier le mode de paiement', icon: 'edit' },
]

const paymentModeStore = usePaymentModeStore()

const router = useRouter()
const route = useRoute()
const $q = useQuasar()

const paymentModeId = computed(() => route.params.id as string)
const paymentMode = computed(() => paymentModeStore.paymentMode)

const paymentModeForm = ref<InstanceType<typeof PaymentModeForm> | null>(null)
const deletePaymentModeDialog = ref<InstanceType<typeof DeletePaymentModeDialog> | null>(null)

const updatePaymentMode = async (formData: PaymentModeFormData) => {
  working.value = true
  await paymentModeStore.updatePaymentMode(paymentModeId.value, formData)
  working.value = false
  $q.notify({ type: 'positive', message: 'Le mode de paiement a été mis à jour avec succès.' })
  await router.push({ name: 'payment-modes' })
}

const deletePaymentMode = async () => {
  working.value = true
  await paymentModeStore.deletePaymentMode(paymentModeId.value)
  working.value = false
  $q.notify({ type: 'positive', message: 'Le mode de paiement a été supprimé avec succès.' })
  await router.push({ name: 'payment-modes' })
}

const loading = ref(true)
const working = ref(false)
onMounted(async () => {
  await paymentModeStore.fetchPaymentMode(paymentModeId.value)
  loading.value = false
})
</script>
