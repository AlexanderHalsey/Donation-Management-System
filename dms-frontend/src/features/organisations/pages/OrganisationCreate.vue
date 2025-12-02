<template>
  <Page title="Nouvelle organisation" :breadcrumbs="breadcrumbs" :working="working">
    <template #actions>
      <Btn
        color="primary"
        icon="add"
        @click="organisationForm?.validate()"
        data-cy="create-organisation"
      >
        Créer
      </Btn>
    </template>
    <OrganisationForm
      ref="organisationForm"
      data-cy="organisation-form"
      @submit="createOrganisation"
    />
  </Page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

import Page from '@/layouts/Page.vue'
import Btn from '@/components/ui/Btn.vue'
import OrganisationForm from '../components/OrganisationForm.vue'

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
  { id: 'organisation-create', label: 'Nouvelle organisation', icon: 'add' },
]

const $q = useQuasar()
const router = useRouter()

const organisationStore = useOrganisationStore()

const organisationForm = ref<InstanceType<typeof OrganisationForm> | null>(null)
const working = ref(false)

const createOrganisation = async (formData: OrganisationFormData) => {
  working.value = true
  await organisationStore.createOrganisation(formData)
  working.value = false
  $q.notify({ type: 'positive', message: "L'organisation a été créée avec succès." })
  await router.push({ name: 'organisations' })
}
</script>
