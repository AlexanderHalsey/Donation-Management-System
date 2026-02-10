<template>
  <Page :title="t('labels.newDonationMethod')" :breadcrumbs="breadcrumbs" :working="working">
    <template #actions>
      <Btn
        color="primary"
        icon="add"
        @click="donationMethodForm?.validate()"
        data-cy="create-donation-method"
      >
        {{ t('actions.create') }}
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
import { computed, ref } from 'vue'
import { useI18n } from '@/composables'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

import { AxiosError } from 'axios'

import Page from '@/layouts/Page.vue'
import Btn from '@/components/ui/Btn.vue'
import DonationMethodForm from '../components/DonationMethodForm.vue'

import { useDonationMethodStore } from '@/stores'

import type { DonationMethodFormData } from '../types'

import type { Breadcrumb } from '@/types'

const { t } = useI18n()

const breadcrumbs = computed<Breadcrumb[]>(() => [
  {
    id: 'donation-method-list',
    label: t('labels.listOfDonationMethods'),
    to: '/donation-methods',
    icon: 'article',
  },
  { id: 'donation-method-create', label: t('labels.newDonationMethod'), icon: 'add' },
])

const $q = useQuasar()
const router = useRouter()

const donationMethodStore = useDonationMethodStore()

const donationMethodForm = ref<InstanceType<typeof DonationMethodForm> | null>(null)

const createDonationMethod = async (formData: DonationMethodFormData) => {
  working.value = true
  try {
    await donationMethodStore.createDonationMethod(formData)
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response?.status === 409) {
      donationMethodForm.value?.setErrors({ name: t('errors.donationMethodAlreadyExists') })
    }
    working.value = false
    throw error
  }
  working.value = false
  $q.notify({ type: 'positive', message: t('notifications.donationMethodCreated') })
  await router.push({ name: 'donation-methods' })
}

const working = ref(false)
</script>
