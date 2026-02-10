<template>
  <Page :title="t('labels.updatePaymentMode')" :breadcrumbs="breadcrumbs" :loading="loading">
    <template #actions>
      <Btn
        outline
        icon="delete"
        class="text-red-8 q-mr-md"
        data-cy="delete-payment-mode"
        @click="deletePaymentModeDialog?.open()"
      >
        {{ t('actions.delete') }}
      </Btn>
      <Btn
        color="primary"
        icon="edit"
        data-cy="update-payment-mode"
        @click="paymentModeForm?.validate()"
      >
        {{ t('actions.update') }}
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
import { useI18n } from '@/composables'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

import { AxiosError } from 'axios'

import Page from '@/layouts/Page.vue'
import Btn from '@/components/ui/Btn.vue'

import PaymentModeForm from '../components/PaymentModeForm.vue'
import DeletePaymentModeDialog from '../components/DeletePaymentModeDialog.vue'

import { usePaymentModeStore } from '@/stores'

import type { PaymentModeFormData } from '../types'
import type { Breadcrumb } from '@/types'

const { t } = useI18n()

const breadcrumbs: Breadcrumb[] = [
  {
    id: 'payment-mode-list',
    label: t('labels.listOfPaymentModes'),
    to: '/payment-modes',
    icon: 'point_of_sale',
  },
  {
    id: 'payment-mode-update',
    label: t('labels.updatePaymentMode'),
    icon: 'edit',
  },
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
  try {
    await paymentModeStore.updatePaymentMode(paymentModeId.value, formData)
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response?.status === 409) {
      paymentModeForm.value?.setErrors({ name: t('errors.paymentModeAlreadyExists') })
    }
    working.value = false
    throw error
  }
  working.value = false
  $q.notify({ type: 'positive', message: t('notifications.paymentModeUpdated') })
  await router.push({ name: 'payment-modes' })
}

const deletePaymentMode = async () => {
  working.value = true
  await paymentModeStore.deletePaymentMode(paymentModeId.value)
  working.value = false
  $q.notify({ type: 'positive', message: t('notifications.paymentModeDeleted') })
  await router.push({ name: 'payment-modes' })
}

const loading = ref(true)
const working = ref(false)
onMounted(async () => {
  await paymentModeStore.fetchPaymentMode(paymentModeId.value)
  loading.value = false
})
</script>
