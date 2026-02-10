<template>
  <Page :title="t('labels.updateDonationType')" :breadcrumbs="breadcrumbs" :loading="loading">
    <template #actions>
      <Btn
        outline
        icon="delete"
        class="text-red-8 q-mr-md"
        data-cy="delete-donation-type"
        @click="deleteDonationTypeDialog?.open()"
      >
        {{ t('actions.delete') }}
      </Btn>
      <Btn
        color="primary"
        icon="edit"
        data-cy="update-donation-type"
        @click="donationTypeForm?.validate()"
      >
        {{ t('actions.update') }}
      </Btn>
    </template>
    <DonationTypeForm
      ref="donationTypeForm"
      :donation-type="donationType"
      :organisation-options="organisations"
      @submit="updateDonationType"
    />
    <DeleteDonationTypeDialog
      ref="deleteDonationTypeDialog"
      @delete:donationType="deleteDonationType"
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

import DonationTypeForm from '../components/DonationTypeForm.vue'
import DeleteDonationTypeDialog from '../components/DeleteDonationTypeDialog.vue'

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
    id: 'donation-type-update',
    label: t('labels.updateDonationType'),
    icon: 'edit',
  },
])

const donationTypeStore = useDonationTypeStore()
const organisationListStore = useOrganisationListStore()

const router = useRouter()
const route = useRoute()
const $q = useQuasar()

const donationTypeId = computed(() => route.params.donationTypeId as string)
const donationType = computed(() => donationTypeStore.donationType)
const organisations = computed(() => organisationListStore.organisationRefList)

const donationTypeForm = ref<InstanceType<typeof DonationTypeForm> | null>(null)
const deleteDonationTypeDialog = ref<InstanceType<typeof DeleteDonationTypeDialog> | null>(null)

const updateDonationType = async (formData: DonationTypeFormData) => {
  working.value = true
  try {
    await donationTypeStore.updateDonationType(donationTypeId.value, formData)
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response?.status === 409) {
      donationTypeForm.value?.setErrors({ name: t('errors.donationTypeAlreadyExists') })
    }
    working.value = false
    throw error
  }
  working.value = false
  $q.notify({ type: 'positive', message: t('notifications.donationTypeUpdated') })
  await router.push({ name: 'donation-types' })
}

const deleteDonationType = async () => {
  working.value = true
  await donationTypeStore.deleteDonationType(donationTypeId.value)
  working.value = false
  $q.notify({ type: 'positive', message: t('notifications.donationTypeDeleted') })
  await router.push({ name: 'donation-types' })
}

const loading = ref(true)
const working = ref(false)
onMounted(async () => {
  await Promise.all([
    donationTypeStore.fetchDonationType(donationTypeId.value),
    organisationListStore.fetchOrganisationRefs(),
  ])
  loading.value = false
})
</script>
