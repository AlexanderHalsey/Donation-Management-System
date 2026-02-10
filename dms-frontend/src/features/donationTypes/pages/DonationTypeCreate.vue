<template>
  <Page :title="t('labels.newDonationType')" :breadcrumbs="breadcrumbs" :working="working">
    <template #actions>
      <Btn
        color="primary"
        icon="add"
        @click="donationTypeForm?.validate()"
        data-cy="create-donation-type"
      >
        {{ t('actions.create') }}
      </Btn>
    </template>
    <DonationTypeForm
      ref="donationTypeForm"
      :organisation-options="organisations"
      data-cy="donation-type-form"
      @submit="createDonationType"
    />
  </Page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from '@/composables'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

import { AxiosError } from 'axios'

import Page from '@/layouts/Page.vue'
import Btn from '@/components/ui/Btn.vue'
import DonationTypeForm from '../components/DonationTypeForm.vue'

import { useDonationTypeStore, useOrganisationListStore } from '@/stores'

import type { DonationTypeFormData } from '../types'
import type { Breadcrumb } from '@/types'

const { t } = useI18n()

const breadcrumbs = computed<Breadcrumb[]>(() => [
  {
    id: 'donation-type-list',
    label: t('labels.listOfDonationTypes'),
    to: '/donation-types',
    icon: 'favorite',
  },
  {
    id: 'donation-type-create',
    label: t('labels.newDonationType'),
    icon: 'add',
  },
])

const $q = useQuasar()
const router = useRouter()

const donationTypeStore = useDonationTypeStore()
const organisationListStore = useOrganisationListStore()

const donationTypeForm = ref<InstanceType<typeof DonationTypeForm> | null>(null)
const working = ref(false)

const organisations = computed(() => organisationListStore.organisationRefList)

const createDonationType = async (formData: DonationTypeFormData) => {
  working.value = true
  try {
    await donationTypeStore.createDonationType(formData)
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response?.status === 409) {
      donationTypeForm.value?.setErrors({ name: t('errors.donationTypeAlreadyExists') })
    }
    working.value = false
    throw error
  }
  working.value = false
  $q.notify({ type: 'positive', message: t('notifications.donationTypeCreated') })
  await router.push({ name: 'donation-types' })
}

onMounted(async () => {
  await organisationListStore.fetchOrganisationRefs()
})
</script>
