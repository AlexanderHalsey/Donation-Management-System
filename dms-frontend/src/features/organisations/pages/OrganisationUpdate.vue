<template>
  <Page title="Modifier l'organisation" :breadcrumbs="breadcrumbs" :loading="loading">
    <template #actions>
      <Btn
        outline
        icon="delete"
        class="text-red-8 q-mr-md"
        data-cy="delete-organisation"
        @click="deleteOrganisationDialog?.open()"
      >
        Supprimer
      </Btn>
      <Btn
        color="primary"
        icon="edit"
        data-cy="update-organisation"
        @click="organisationForm?.validate()"
      >
        Mettre à jour
      </Btn>
    </template>
    <OrganisationForm
      ref="organisationForm"
      :organisation="organisation"
      @submit="updateOrganisation"
    />
    <DeleteOrganisationDialog
      ref="deleteOrganisationDialog"
      @delete:organisation="deleteOrganisation"
    />
  </Page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

import { AxiosError } from 'axios'

import Page from '@/layouts/Page.vue'
import Btn from '@/components/ui/Btn.vue'

import OrganisationForm from '../components/OrganisationForm.vue'
import DeleteOrganisationDialog from '../components/DeleteOrganisationDialog.vue'

import { useOrganisationStore } from '@/stores'

import type { OrganisationFormData } from '../types'
import type { Breadcrumb } from '@/types'

const breadcrumbs: Breadcrumb[] = [
  {
    id: 'organisation-list',
    label: 'Liste des organisations',
    to: '/organisations',
    icon: 'account_balance',
  },
  { id: 'organisation-update', label: "Modifier l'organisation", icon: 'edit' },
]

const organisationStore = useOrganisationStore()

const router = useRouter()
const route = useRoute()
const $q = useQuasar()

const organisationId = computed(() => route.params.organisationId as string)
const organisation = computed(() => organisationStore.organisation)

const organisationForm = ref<InstanceType<typeof OrganisationForm> | null>(null)
const deleteOrganisationDialog = ref<InstanceType<typeof DeleteOrganisationDialog> | null>(null)

const updateOrganisation = async (formData: OrganisationFormData) => {
  working.value = true
  try {
    await organisationStore.updateOrganisation(organisationId.value, formData)
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response?.status === 409) {
      $q.notify({
        type: 'negative',
        message: 'Une organisation avec ce nom existe déjà. Veuillez en choisir un autre.',
      })
    }
    working.value = false
    throw error
  }
  working.value = false
  $q.notify({ type: 'positive', message: "L'organisation a été mise à jour avec succès." })
  await router.push({ name: 'organisations' })
}

const deleteOrganisation = async () => {
  working.value = true
  await organisationStore.deleteOrganisation(organisationId.value)
  working.value = false
  $q.notify({ type: 'positive', message: "L'organisation a été supprimée avec succès." })
  await router.push({ name: 'organisations' })
}

const loading = ref(true)
const working = ref(false)
onMounted(async () => {
  await organisationStore.fetchOrganisation(organisationId.value)
  loading.value = false
})
</script>
