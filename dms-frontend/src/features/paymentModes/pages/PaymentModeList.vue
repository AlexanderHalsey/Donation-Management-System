<template>
  <Page title="Liste des modes de paiement" :breadcrumbs="breadcrumbs" :loading="loading">
    <template #actions>
      <Btn to="/payment-modes/create" icon="add" color="primary" class="q-mr-sm"> Nouveau </Btn>
    </template>
    <PaymentModeListTable
      :payment-mode-list="paymentModeList"
      @delete:payment-mode="deletePaymentMode"
    />
  </Page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'

import Page from '@/layouts/Page.vue'
import Btn from '@/components/ui/Btn.vue'

import PaymentModeListTable from '../components/PaymentModeListTable.vue'

import { usePaymentModeListStore, usePaymentModeStore } from '@/stores'

import type { Breadcrumb } from '@/types'

const breadcrumbs: Breadcrumb[] = [
  {
    id: 'payment-mode-list',
    label: 'Liste des modes de paiement',
    icon: 'point_of_sale',
  },
]

const $q = useQuasar()

const paymentModeListStore = usePaymentModeListStore()
const paymentModeStore = usePaymentModeStore()

const paymentModeList = computed(() => paymentModeListStore.paymentModeList)

const loading = ref(true)
const working = ref(false)

const deletePaymentMode = async (paymentModeId: string) => {
  working.value = true
  await paymentModeStore.deletePaymentMode(paymentModeId)
  working.value = false
  $q.notify({ type: 'positive', message: 'Le mode de paiement a été supprimé avec succès.' })
}

onMounted(async () => {
  await paymentModeListStore.fetchPaymentModes()
  loading.value = false
})
</script>
