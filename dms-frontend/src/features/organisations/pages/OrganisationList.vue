<template>
  <Page title="Liste des organisations" :breadcrumbs="breadcrumbs" :loading="loading">
    <template #actions>
      <Btn to="/organisations/create" icon="add" color="primary" class="q-mr-sm"> Nouveau </Btn>
    </template>
    <OrganisationListTable
      :organisation-list="organisationList"
      @delete:organisation="deleteOrganisation"
    />
  </Page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'

import Page from '@/layouts/Page.vue'
import Btn from '@/components/ui/Btn.vue'

import OrganisationListTable from '../components/OrganisationListTable.vue'

import { useOrganisationListStore, useOrganisationStore } from '@/stores'

import type { Breadcrumb } from '@/types'

const breadcrumbs: Breadcrumb[] = [
  {
    id: 'organisation-list',
    label: 'Liste des organisations',
    icon: 'account_balance',
  },
]

const $q = useQuasar()

const organisationListStore = useOrganisationListStore()
const organisationStore = useOrganisationStore()

const organisationList = computed(() => organisationListStore.organisationList)

const loading = ref(true)
const working = ref(false)

const deleteOrganisation = async (organisationId: string) => {
  working.value = true
  await organisationStore.deleteOrganisation(organisationId)
  await organisationListStore.fetchOrganisations()
  working.value = false
  $q.notify({ type: 'positive', message: "L'organisation a été supprimée avec succès." })
}

onMounted(async () => {
  await organisationListStore.fetchOrganisations()
  loading.value = false
})
</script>
