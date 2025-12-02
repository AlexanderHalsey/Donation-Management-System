import { ref } from 'vue'
import { defineStore } from 'pinia'

import {
  disableOrganisation,
  getOrganisation,
  postOrganisation,
  putOrganisation,
} from '@/apis/dms-api'

import type { Organisation } from '@shared/models'
import type { OrganisationFormData } from '@/features/organisations'

export const useOrganisationStore = defineStore('organisation', () => {
  const organisation = ref<Organisation>()

  const fetchOrganisation = async (organisationId: string) => {
    organisation.value = await getOrganisation(organisationId)
  }

  const createOrganisation = async (formData: OrganisationFormData) => {
    organisation.value = await postOrganisation(formData)
  }

  const updateOrganisation = async (organisationId: string, formData: OrganisationFormData) => {
    organisation.value = await putOrganisation(organisationId, formData)
  }

  const deleteOrganisation = async (organisationId: string) => {
    await disableOrganisation(organisationId)
    organisation.value = undefined
  }

  return {
    createOrganisation,
    deleteOrganisation,
    organisation,
    fetchOrganisation,
    updateOrganisation,
  }
})
