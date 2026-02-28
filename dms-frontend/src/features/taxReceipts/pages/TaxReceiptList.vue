<template>
  <Page
    :title="t('labels.listOfTaxReceipts')"
    :breadcrumbs="breadcrumbs"
    :loading="loading"
    :working="working"
  >
    <template #actions>
      <BtnDropdown
        v-if="annualReceiptCreationOptionList.length > 0"
        :label="t('labels.createAnnualTaxReceipts')"
        icon="add"
        color="primary"
        class="q-mr-sm"
        data-cy="create-annual-tax-receipts-button"
      >
        <QList>
          <QItem
            v-for="(yearOrganisationPair, index) in annualReceiptCreationOptionList"
            :to="
              yearOrganisationPair.isReleased
                ? `/tax-receipts/annual-create/${yearOrganisationPair.year}/${yearOrganisationPair.organisationId}`
                : null
            "
            :key="index"
            :clickable="yearOrganisationPair.isReleased"
            v-close-popup
          >
            <QItemSection>
              <QItemLabel :class="yearOrganisationPair.isReleased ? '' : 'text-grey'">
                {{ yearOrganisationPair.year }}
                <span class="q-mx-md">-</span>
                <QIcon name="account_balance" class="q-mr-md" />
                {{ getOrganisationRefById(yearOrganisationPair.organisationId).name }}

                <QTooltip
                  v-if="!yearOrganisationPair.isReleased && annualReceiptReleaseDate"
                  :offset="[10, 10]"
                >
                  {{
                    t('labels.annualReceiptCreationTooltip', {
                      year: yearOrganisationPair.year,
                      date: format(annualReceiptReleaseDate, 'date', {
                        locale: locale === 'fr' ? fr : enGB,
                      }),
                    })
                  }}
                </QTooltip>
              </QItemLabel>
            </QItemSection>
          </QItem>
        </QList>
      </BtnDropdown>
      <TaxReceiptListFilter
        :filter="filter"
        :donors="donors"
        data-cy="tax-receipt-list-filter"
        @update:filter="onFilterUpdate"
      />
    </template>
    <TaxReceiptListTable
      :taxReceiptList="taxReceiptList"
      :pagination="pagination"
      :loading="tableLoading"
      :has-full-visual-access="hasFullVisualAccess"
      @update:pagination="fetchTaxReceipts"
      @cancel:taxReceipt="cancelTaxReceipt"
      @retry-failed:tax-receipt="retryFailedTaxReceipt"
    />
  </Page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from '@/composables'

import { omit } from 'es-toolkit'
import { format } from 'date-fns'
import { fr, enGB } from 'date-fns/locale'

import Page from '@/layouts/Page.vue'

import BtnDropdown from '@/components/ui/BtnDropdown.vue'

import TaxReceiptListTable from '../components/TaxReceiptListTable.vue'
import TaxReceiptListFilter from '../components/TaxReceiptListFilter.vue'

import { getOrganisationRefById } from '@/features/organisations'

import {
  useAnnualTaxReceiptsStore,
  useAuthStore,
  useDonorListStore,
  useOrganisationListStore,
  useTaxReceiptListStore,
} from '@/stores'

import type { Breadcrumb, LazySelectOptions } from '@/types'
import type {
  DonorRefSelect,
  TaxReceiptListFilter as TaxReceiptListFilterRequest,
  TaxReceiptListItem,
  TaxReceiptListPaginationRequest,
} from '@shared/models'
import type { CancelTaxReceiptFormData } from '../types'

const { t, locale } = useI18n()

const breadcrumbs: Breadcrumb[] = [
  {
    id: 'tax-receipt-list',
    label: t('labels.listOfTaxReceipts'),
    icon: 'receipt_long',
  },
]

const $q = useQuasar()

const authStore = useAuthStore()
const hasFullVisualAccess = computed(() => authStore.hasFullVisualAccess)

const organisationListStore = useOrganisationListStore()
const taxReceiptListStore = useTaxReceiptListStore()
const annualTaxReceiptStore = useAnnualTaxReceiptsStore()
const donorListStore = useDonorListStore()

const taxReceiptList = computed(() => taxReceiptListStore.taxReceiptList)
const pagination = computed(() => taxReceiptListStore.pagination)
const paginationRequest = computed<TaxReceiptListPaginationRequest>(() =>
  omit(pagination.value, ['totalCount']),
)
const filter = computed(() => taxReceiptListStore.filter)

const donors = computed<LazySelectOptions<DonorRefSelect>>(() => ({
  options: donorListStore.donorRefList,
  load: async () => await donorListStore.fetchDonorRefs(),
}))

const annualReceiptCreationOptionList = computed(
  () => annualTaxReceiptStore.eligibleTaxReceiptYearOrganisations?.yearOrganisationPairs ?? [],
)
const annualReceiptReleaseDate = computed(
  () => annualTaxReceiptStore.eligibleTaxReceiptYearOrganisations?.releaseDate,
)

const loading = ref(true)
const working = ref(false)
const tableLoading = ref(false)

const fetchTaxReceipts = async (paginationRequest: TaxReceiptListPaginationRequest) => {
  tableLoading.value = true
  try {
    await taxReceiptListStore.fetchTaxReceipts(paginationRequest)
  } finally {
    tableLoading.value = false
  }
}

const onFilterUpdate = async (filter?: TaxReceiptListFilterRequest) => {
  taxReceiptListStore.updateFilter(filter)
  await fetchTaxReceipts({
    ...paginationRequest.value,
    page: 1,
  })
}

const cancelTaxReceipt = async (formData: CancelTaxReceiptFormData) => {
  working.value = true
  try {
    await taxReceiptListStore.cancel(formData)
  } finally {
    working.value = false
  }
  $q.notify({ type: 'positive', message: "Le reçu fiscal est en cours d'annulation." })
  // Refetch tax receipts to update the list
  await fetchTaxReceipts(paginationRequest.value)
}

const retryFailedTaxReceipt = async (taxReceipt: TaxReceiptListItem) => {
  working.value = true
  try {
    await taxReceiptListStore.retryFailedTaxReceiptGeneration(taxReceipt.id)
  } finally {
    working.value = false
  }
  $q.notify({ type: 'positive', message: 'Le reçu fiscal est en cours de régénération.' })
  // Refetch tax receipts to update the list
  await fetchTaxReceipts(paginationRequest.value)
}

onMounted(async () => {
  await Promise.all([
    fetchTaxReceipts(paginationRequest.value),
    organisationListStore.fetchOrganisationRefs(),
    hasFullVisualAccess.value
      ? annualTaxReceiptStore.fetchEligibleTaxReceiptYearOrganisations()
      : Promise.resolve(),
  ])
  loading.value = false
})
</script>
