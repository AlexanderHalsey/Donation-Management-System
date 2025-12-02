import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { getOrganisationRefs, getOrganisations } from '@/apis/dms-api'

import type { Organisation, OrganisationRef } from '@shared/models'

export const useOrganisationListStore = defineStore('organisationList', () => {
  const organisationList = ref<Organisation[]>([])
  const organisationRefList = ref<OrganisationRef[]>([])
  const refsInitialized = ref(false)

  const activeOrganisationRefList = computed(() =>
    organisationRefList.value.filter((organisation) => !organisation.isDisabled),
  )

  const fetchOrganisations = async () => {
    organisationList.value = await getOrganisations()
  }

  const fetchOrganisationRefs = async () => {
    if (!refsInitialized.value) {
      organisationRefList.value = await getOrganisationRefs()
      refsInitialized.value = true
    }
  }

  return {
    activeOrganisationRefList,
    fetchOrganisationRefs,
    fetchOrganisations,
    organisationList,
    organisationRefList,
    refsInitialized,
  }
})
