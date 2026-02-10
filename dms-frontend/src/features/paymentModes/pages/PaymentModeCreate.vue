<template>
  <Page :title="t('labels.newPaymentMode')" :breadcrumbs="breadcrumbs" :working="working">
    <template #actions>
      <Btn
        color="primary"
        icon="add"
        @click="paymentModeForm?.validate()"
        data-cy="create-payment-mode"
      >
        {{ t('actions.create') }}
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
import { useI18n } from '@/composables'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

import { AxiosError } from 'axios'

import Page from '@/layouts/Page.vue'
import Btn from '@/components/ui/Btn.vue'
import PaymentModeForm from '../components/PaymentModeForm.vue'

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
  { id: 'payment-mode-create', label: t('labels.newPaymentMode'), icon: 'add' },
]

const $q = useQuasar()
const router = useRouter()

const paymentModeStore = usePaymentModeStore()

const paymentModeForm = ref<InstanceType<typeof PaymentModeForm> | null>(null)

const createPaymentMode = async (formData: PaymentModeFormData) => {
  working.value = true
  try {
    await paymentModeStore.createPaymentMode(formData)
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response?.status === 409) {
      paymentModeForm.value?.setErrors({ name: t('errors.paymentModeAlreadyExists') })
    }
    working.value = false
    throw error
  }
  working.value = false
  $q.notify({ type: 'positive', message: t('notifications.paymentModeCreated') })
  await router.push({ name: 'payment-modes' })
}

const working = ref(false)
</script>
