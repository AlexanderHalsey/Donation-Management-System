import { ref } from 'vue'
import { defineStore } from 'pinia'

import { pick } from 'es-toolkit'

import { useOrganisationListStore } from './organisationList'

import {
  disableOrganisation,
  getOrganisation,
  postOrganisation,
  putOrganisation,
} from '@/apis/dms-api'

import type { Organisation } from '@shared/models'
import type { OrganisationFormData } from '@/features/organisations'

export const useOrganisationStore = defineStore('organisation', () => {
  const organisationListStore = useOrganisationListStore()

  const organisation = ref<Organisation>()

  const fetchOrganisation = async (organisationId: string) => {
    organisation.value = await getOrganisation(organisationId)
  }

  const createOrganisation = async (formData: OrganisationFormData) => {
    organisation.value = await postOrganisation(formData)
    organisationListStore.organisationRefList.push(
      pick(organisation.value, ['id', 'name', 'isDisabled', 'isTaxReceiptEnabled']),
    )
  }

  const updateOrganisation = async (organisationId: string, formData: OrganisationFormData) => {
    organisation.value = await putOrganisation(organisationId, formData)
    const index = organisationListStore.organisationRefList.findIndex(
      (organisation) => organisation.id === organisationId,
    )
    if (index !== -1) {
      organisationListStore.organisationRefList[index] = pick(organisation.value, [
        'id',
        'name',
        'isDisabled',
        'isTaxReceiptEnabled',
      ])
    }
  }

  const deleteOrganisation = async (organisationId: string) => {
    await disableOrganisation(organisationId)
    organisation.value = undefined
    const index = organisationListStore.organisationRefList.findIndex(
      (organisation) => organisation.id === organisationId,
    )
    if (index !== -1) {
      organisationListStore.organisationRefList.splice(index, 1)
    }
  }

  return {
    createOrganisation,
    deleteOrganisation,
    organisation,
    fetchOrganisation,
    updateOrganisation,
  }
})
