import { useDonationTypeListStore, useOrganisationListStore } from '@/stores'

import type { OrganisationRef } from '@shared/models'

export const getOrganisationRefById = (id: string): OrganisationRef => {
  const organisationListStore = useOrganisationListStore()
  const organisation = organisationListStore.organisationRefList.find((org) => org.id === id)
  if (!organisation) throw new Error(`Organisation with id ${id} not found`)
  return organisation
}

export const getOrganisationRefByDonationTypeId = (id: string): OrganisationRef => {
  const donationTypeListStore = useDonationTypeListStore()
  const donationType = donationTypeListStore.donationTypeList.find((dt) => dt.id === id)
  if (!donationType) throw new Error(`Donation type with id ${id} not found`)
  return getOrganisationRefById(donationType.organisationId)
}
