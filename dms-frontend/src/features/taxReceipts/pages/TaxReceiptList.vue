<template>
  <Page
    title="Liste des reçus fiscaux"
    :breadcrumbs="breadcrumbs"
    :loading="loading"
    :working="working"
  >
    <template #actions>
      <BtnDropdown
        v-if="annualReceiptCreationOptionList.length > 0"
        label="Créer des reçus annuels"
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
                  La création des reçus fiscaux pour l'année {{ yearOrganisationPair.year }} peut
                  être effectuée après le <FormattedDate :value="annualReceiptReleaseDate" />.
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
      @update:pagination="fetchTaxReceipts"
      @cancel:taxReceipt="cancelTaxReceipt"
      @retry-failed:tax-receipt="retryFailedTaxReceipt"
    />
  </Page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'

import { omit } from 'es-toolkit'

import Page from '@/layouts/Page.vue'

import BtnDropdown from '@/components/ui/BtnDropdown.vue'
import FormattedDate from '@/components/FormattedDate.vue'

import TaxReceiptListTable from '../components/TaxReceiptListTable.vue'
import TaxReceiptListFilter from '../components/TaxReceiptListFilter.vue'

import { getOrganisationRefById } from '@/features/organisations'

import {
  useAnnualTaxReceiptsStore,
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

const breadcrumbs: Breadcrumb[] = [
  { id: 'tax-receipt-list', label: 'Liste des reçus fiscaux', icon: 'receipt_long' },
]

const $q = useQuasar()

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
  await taxReceiptListStore.fetchTaxReceipts(paginationRequest)
  tableLoading.value = false
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
  await taxReceiptListStore.cancel(formData)
  working.value = false
  $q.notify({ type: 'positive', message: "Le reçu fiscal est en cours d'annulation." })
  // Refetch tax receipts to update the list
  await fetchTaxReceipts(paginationRequest.value)
}

const retryFailedTaxReceipt = async (taxReceipt: TaxReceiptListItem) => {
  working.value = true
  await taxReceiptListStore.retryFailedTaxReceiptGeneration(taxReceipt.id)
  working.value = false
  $q.notify({ type: 'positive', message: 'Le reçu fiscal est en cours de régénération.' })
  // Refetch tax receipts to update the list
  await fetchTaxReceipts(paginationRequest.value)
}

onMounted(async () => {
  await Promise.all([
    fetchTaxReceipts(paginationRequest.value),
    organisationListStore.fetchOrganisationRefs(),
    annualTaxReceiptStore.fetchEligibleTaxReceiptYearOrganisations(),
  ])
  loading.value = false
})
</script>
