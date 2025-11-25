import { ref } from 'vue'
import { defineStore } from 'pinia'

import { getOrganisationRefs } from '@/apis/dms-api'

import type { OrganisationRef } from '@shared/models'

export const useOrganisationListStore = defineStore('organisationList', () => {
  const organisationRefList = ref<OrganisationRef[]>([])
  const refsInitialized = ref(false)

  const fetchOrganisationRefs = async () => {
    if (!refsInitialized.value) {
      organisationRefList.value = await getOrganisationRefs()
      refsInitialized.value = true
    }
  }

  return {
    fetchOrganisationRefs,
    organisationRefList,
    refsInitialized,
  }
})
