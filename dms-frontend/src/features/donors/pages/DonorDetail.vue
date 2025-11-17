<template>
  <Page :title="title" :breadcrumbs="breadcrumbs" :loading="loading">
    <div v-if="donor" style="max-width: 1200px">
      <div class="row q-col-gutter-md">
        <div class="col" style="display: flex; flex-direction: column">
          <QCard class="q-mb-md col-grow">
            <QCardSection>
              <div class="text-h6 q-mb-md flex items-center">
                <QIcon name="person" class="q-mr-sm" />
                Informations personnelles
              </div>
              <div class="row q-col-gutter-xl">
                <TitledComponent title="Nom complet" class="col-auto">
                  {{ getDonorFullName(donor, false) }}
                </TitledComponent>
                <TitledComponent title="Civilité" class="col-auto">
                  {{ donor.civility || '-' }}
                </TitledComponent>
                <TitledComponent title="ID externe" class="col-auto"
                  >#{{ donor.externalId }}</TitledComponent
                >
                <TitledComponent title="Statut" class="col-auto">
                  <QChip
                    :color="donor.isDisabled ? 'negative' : 'positive'"
                    text-color="white"
                    size="sm"
                    :icon="donor.isDisabled ? 'block' : 'check_circle'"
                  >
                    {{ donor.isDisabled ? 'Désactivé' : 'Actif' }}
                  </QChip>
                  <QChip
                    v-if="donor.isFacilitator"
                    color="info"
                    text-color="white"
                    size="sm"
                    icon="support_agent"
                    class="q-ml-xs"
                  >
                    Facilitateur
                  </QChip>
                </TitledComponent>
                <TitledComponent title="Email" class="col-auto">
                  <a v-if="donor.email" :href="`mailto:${donor.email}`" class="text-primary">
                    {{ donor.email }}
                  </a>
                  <span v-else>-</span>
                </TitledComponent>
                <TitledComponent title="Téléphone" class="col-auto">
                  <a
                    v-if="donor.phoneNumber"
                    :href="`tel:${donor.phoneNumber}`"
                    class="text-primary"
                  >
                    {{ donor.phoneNumber }}
                  </a>
                  <span v-else>-</span>
                </TitledComponent>
                <TitledComponent title="Dernière mise à jour" class="col">
                  <FormattedDate :value="donor.updatedAt" pattern="date-time" />
                </TitledComponent>
              </div>
            </QCardSection>
          </QCard>
          <QCard class="col-grow">
            <QCardSection>
              <div class="text-h6 q-mb-md flex items-center">
                <QIcon name="location_on" class="q-mr-sm" />
                Adresse
              </div>
              <div v-if="!hasAddressData" class="text-grey-6 text-italic">
                Aucune adresse renseignée
              </div>
              <div v-else class="row q-gutter-xl">
                <TitledComponent
                  v-for="field in addressFields"
                  :key="field.key"
                  :title="field.label"
                  class="col-auto"
                >
                  {{ donor?.[field.key] || '&nbsp;-' }}
                </TitledComponent>
              </div>
            </QCardSection>
          </QCard>
        </div>
        <div class="col-12 col-md-5 col-grow">
          <QCard class="full-height">
            <QCardSection class="full-height column">
              <div class="text-h6 q-mb-md">
                <QIcon name="bar_chart" class="q-mr-sm" />
                Statistiques de dons
              </div>
              <div class="row q-col-gutter-md col-grow">
                <div class="col col-md-12">
                  <StatsCard
                    icon="volunteer_activism"
                    icon-color="primary"
                    :value="donor.donationCount"
                    :label="donor.donationCount <= 1 ? 'Don effectué' : 'Dons effectués'"
                  />
                </div>
                <div class="col col-md-12">
                  <StatsCard icon="euro" icon-color="positive" :label="'Montant total des dons'">
                    <template #value>
                      <FormattedCurrency :value="donor.donationTotalAmount" />
                    </template>
                  </StatsCard>
                </div>
                <div class="col col-md-12">
                  <StatsCard
                    v-if="donor.donationCount > 0"
                    icon="trending_up"
                    icon-color="info"
                    label="Montant moyen par don"
                  >
                    <template #value>
                      <FormattedCurrency :value="averageDonationAmount" />
                    </template>
                  </StatsCard>
                </div>
              </div>
            </QCardSection>
          </QCard>
        </div>
      </div>
    </div>
  </Page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import Page from '@/layouts/Page.vue'
import TitledComponent from '@/components/TitledComponent.vue'
import StatsCard from '@/components/StatsCard.vue'
import FormattedCurrency from '@/components/FormattedCurrency.vue'
import FormattedDate from '@/components/FormattedDate.vue'

import { useDonorStore } from '@/stores'

import { getDonorFullName } from '../helpers'

import type { Breadcrumb } from '@/types'
import type { Donor } from '@shared/models'

const breadcrumbs = ref<Breadcrumb[]>([
  { id: 'donor-list', label: 'Liste des donateurs', to: '/donors', icon: 'group' },
])
const title = computed(() => {
  return donor.value ? getDonorFullName(donor.value) : 'Détails du donateur'
})
const donorStore = useDonorStore()
const route = useRoute()

const donorId = computed(() => route.params.donorId as string)

const donor = computed(() => donorStore.donor)

const addressFields = computed<{ key: keyof Donor; label: string }[]>(() => [
  { key: 'streetAddress1', label: 'Adresse ligne 1' },
  { key: 'streetAddress2', label: 'Adresse ligne 2' },
  { key: 'postalCode', label: 'Code postal' },
  { key: 'city', label: 'Ville' },
  { key: 'state', label: 'État/Région' },
  { key: 'country', label: 'Pays' },
])

const hasAddressData = computed(() => {
  return addressFields.value.some((field) => donor.value?.[field.key])
})

const averageDonationAmount = computed(() => {
  if (!donor.value || donor.value.donationCount === 0) return 0
  return donor.value.donationTotalAmount / donor.value.donationCount
})

const loading = ref(true)
onMounted(async () => {
  await donorStore.fetchDonor(donorId.value)
  breadcrumbs.value.push({
    id: 'donor-detail',
    label: donor.value ? getDonorFullName(donor.value) : '',
    icon: 'person',
  })
  loading.value = false
})
</script>
