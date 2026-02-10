<template>
  <Page
    :title="`${t('labels.newDonationAssetType')}`"
    :breadcrumbs="breadcrumbs"
    :working="working"
  >
    <template #actions>
      <Btn
        color="primary"
        icon="add"
        @click="donationAssetTypeForm?.validate()"
        data-cy="create-donation-asset-type"
      >
        {{ t('actions.create') }}
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
import { computed, ref } from 'vue'
import { useI18n } from '@/composables'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

import { AxiosError } from 'axios'

import Page from '@/layouts/Page.vue'
import Btn from '@/components/ui/Btn.vue'
import DonationAssetTypeForm from '../components/DonationAssetTypeForm.vue'

import { useDonationAssetTypeStore } from '@/stores'

import type { DonationAssetTypeFormData } from '../types'

import type { Breadcrumb } from '@/types'

const { t } = useI18n()

const breadcrumbs = computed<Breadcrumb[]>(() => [
  {
    id: 'donation-asset-type-list',
    label: t('labels.listOfDonationAssetTypes'),
    to: '/donation-asset-types',
    icon: 'payments',
  },
  {
    id: 'donation-asset-type-create',
    label: `${t('labels.newDonationAssetType')}`,
    icon: 'add',
  },
])

const $q = useQuasar()
const router = useRouter()

const donationAssetTypeStore = useDonationAssetTypeStore()

const donationAssetTypeForm = ref<InstanceType<typeof DonationAssetTypeForm> | null>(null)

const createDonationAssetType = async (formData: DonationAssetTypeFormData) => {
  working.value = true
  try {
    await donationAssetTypeStore.createDonationAssetType(formData)
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response?.status === 409) {
      donationAssetTypeForm.value?.setErrors({
        name: t('errors.donationAssetTypeAlreadyExists'),
      })
    }
    working.value = false
    throw error
  }
  working.value = false
  $q.notify({ type: 'positive', message: t('notifications.donationAssetTypeCreated') })
  await router.push({ name: 'donation-asset-types' })
}

const working = ref(false)
</script>
