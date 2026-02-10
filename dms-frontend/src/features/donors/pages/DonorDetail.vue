<template>
  <Page :title="title" :breadcrumbs="breadcrumbs" :loading="loading">
    <template #actions>
      <Btn
        v-if="donor && isDonorExternalProviderEnabled"
        outline
        icon="contact_page"
        color="primary"
        :href="donorExternalProviderUrl + donor.externalId"
        target="_blank"
      >
        {{ t('actions.goToProfile', { profileName: donorExternalProviderName }) }}
      </Btn>
    </template>
    <div v-if="donor" style="max-width: 1200px">
      <div class="row q-col-gutter-md">
        <div class="col" style="display: flex; flex-direction: column">
          <QCard class="q-mb-md col-grow">
            <QCardSection>
              <div class="text-h6 q-mb-md flex items-center">
                <QIcon name="person" class="q-mr-sm" />
                {{ t('nouns.personalInformation') }}
              </div>
              <div class="row q-col-gutter-xl">
                <TitledComponent :title="t('labels.fullName')" class="col-auto">
                  {{ getDonorFullName(donor, false) }}
                </TitledComponent>
                <TitledComponent :title="t('labels.civility')" class="col-auto">
                  {{ donor.civility || '-' }}
                </TitledComponent>
                <TitledComponent :title="t('labels.externalId')" class="col-auto"
                  >#{{ donor.externalId }}</TitledComponent
                >
                <TitledComponent :title="t('nouns.status')" class="col-auto">
                  <QChip
                    :color="donor.isDisabled ? 'negative' : 'positive'"
                    text-color="white"
                    size="sm"
                    :icon="donor.isDisabled ? 'block' : 'check_circle'"
                  >
                    {{ donor.isDisabled ? t('common.disabled') : t('common.active') }}
                  </QChip>
                  <QChip
                    v-if="donor.isFacilitator"
                    color="info"
                    text-color="white"
                    size="sm"
                    icon="support_agent"
                    class="q-ml-xs"
                  >
                    {{ t('nouns.facilitator') }}
                  </QChip>
                </TitledComponent>
                <TitledComponent :title="t('labels.email')" class="col-auto">
                  <a v-if="donor.email" :href="`mailto:${donor.email}`" class="text-primary">
                    {{ donor.email }}
                  </a>
                  <span v-else>-</span>
                </TitledComponent>
                <TitledComponent :title="t('labels.phoneNumber')" class="col-auto">
                  <a
                    v-if="donor.phoneNumber"
                    :href="`tel:${donor.phoneNumber}`"
                    class="text-primary"
                  >
                    {{ donor.phoneNumber }}
                  </a>
                  <span v-else>-</span>
                </TitledComponent>
                <TitledComponent :title="t('labels.lastUpdate')" class="col-auto">
                  <FormattedDate :value="donor.updatedAt" pattern="date-time" />
                </TitledComponent>
              </div>
            </QCardSection>
          </QCard>
          <DonorAddressCard :donor="donor" class="col-grow" />
        </div>
        <div class="col-12 col-md-5 col-grow">
          <QCard class="full-height">
            <QCardSection class="full-height column">
              <div class="text-h6 q-mb-md">
                <QIcon name="bar_chart" class="q-mr-sm" />
                {{ t('nouns.donationStatistics') }}
              </div>
              <div class="row q-col-gutter-md col-grow">
                <div class="col col-md-12">
                  <StatsCard
                    icon="volunteer_activism"
                    icon-color="primary"
                    :value="donor.donationCount"
                    :label="t('nouns.donationMade', donor.donationCount === 1 ? 1 : 2)"
                  />
                </div>
                <div class="col col-md-12">
                  <StatsCard
                    icon="euro"
                    icon-color="positive"
                    :label="t('labels.totalDonationAmount')"
                  >
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
                    :label="t('labels.averageDonationAmount')"
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
import { useI18n } from '@/composables'

import Page from '@/layouts/Page.vue'

import Btn from '@/components/ui/Btn.vue'
import TitledComponent from '@/components/TitledComponent.vue'
import StatsCard from '@/components/StatsCard.vue'
import FormattedCurrency from '@/components/FormattedCurrency.vue'
import FormattedDate from '@/components/FormattedDate.vue'

import DonorAddressCard from '../components/DonorAddressCard.vue'

import { useDonorStore } from '@/stores'

import { getDonorFullName } from '../helpers'

import type { Breadcrumb } from '@/types'

const { t } = useI18n()

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

const isDonorExternalProviderEnabled =
  import.meta.env.VITE_DONOR_EXTERNAL_PROVIDER_ENABLED === 'true'
const donorExternalProviderName = import.meta.env.VITE_DONOR_EXTERNAL_PROVIDER_NAME
const donorExternalProviderUrl = import.meta.env.VITE_DONOR_EXTERNAL_PROVIDER_URL

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
