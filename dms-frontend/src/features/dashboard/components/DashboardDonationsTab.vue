<template>
  <div class="row q-col-gutter-md">
    <div class="col-6 col-sm-4">
      <LoadingCard
        :loading="!totalDonations"
        loading-height="85px"
        class="q-pa-md text-center"
        data-cy="total-donations"
      >
        <div class="text-caption text-grey">{{ t('labels.totalAllTime') }}</div>
        <div class="text-h6">
          <QIcon name="volunteer_activism" class="text-primary q-mr-sm" />
          {{ totalDonations!.allTime.count }} {{ t('nouns.donation', 2).toLowerCase() }}
        </div>
        <div class="text-h6">
          <QIcon name="euro" class="text-positive q-mr-sm" />
          <FormattedCurrency :value="totalDonations!.allTime.amount" />
        </div>
      </LoadingCard>
    </div>
    <div class="col-6 col-sm-4">
      <LoadingCard
        :loading="!totalDonations"
        loading-height="85px"
        class="q-pa-md text-center"
        data-cy="total-year-donations"
      >
        <div class="text-caption text-grey">{{ t('labels.thisYear') }}</div>
        <div class="text-h6">
          <QIcon name="volunteer_activism" class="text-primary q-mr-sm" />
          {{ totalDonations!.thisYear.count }} {{ t('nouns.donation', 2).toLowerCase() }}
        </div>
        <div class="text-h6 text-center">
          <QIcon name="euro" class="text-positive q-mr-sm" />
          <FormattedCurrency :value="totalDonations!.thisYear.amount" />
        </div>
      </LoadingCard>
    </div>
    <div class="col-6 col-sm-4">
      <LoadingCard
        :loading="!totalDonations"
        loading-height="85px"
        class="q-pa-md text-center"
        data-cy="total-month-donations"
      >
        <div class="text-caption text-grey">{{ t('labels.thisMonth') }}</div>
        <div class="text-h6">
          <QIcon name="volunteer_activism" class="text-primary q-mr-sm" />
          {{ totalDonations!.thisMonth.count }} {{ t('nouns.donation', 2).toLowerCase() }}
        </div>
        <div class="text-h6">
          <QIcon name="euro" class="text-positive q-mr-sm" />
          <FormattedCurrency :value="totalDonations!.thisMonth.amount" />
        </div>
      </LoadingCard>
    </div>
    <div class="col-12 col-md-5">
      <LoadingCard
        :loading="!currentWeekDonations"
        loading-height="402px"
        class="q-pa-md full-height"
        data-cy="current-week-donations"
      >
        <template #title>
          {{ t('labels.donationsOfWeek') }}
          <div class="text-subtitle2 q-mt-md q-mb-lg">
            {{ currentWeekDonations?.count ?? 0 }} {{ t('nouns.donation', 2).toLowerCase() }} |
            <FormattedCurrency :value="currentWeekDonations?.amount ?? 0" />
          </div>
        </template>
        <Table
          :rows="currentWeekDonations?.donations ?? []"
          :columns="currentWeekDonationColumns"
          row-key="id"
          flat
          dense
          v-model:pagination="currentWeekDonationPagination"
          :rows-per-page-options="[]"
        >
          <template #body-cell-amount="props">
            <QTd :props="props">
              <FormattedCurrency :value="props.row.amount" />
            </QTd>
          </template>
          <template #body-cell-donatedAt="props">
            <QTd :props="props">
              <FormattedDate :value="props.row.donatedAt" />
            </QTd>
          </template>
          <template #body-cell-donor="props">
            <QTd :props="props">
              <DonorLink :donor="props.row.donor" />
            </QTd>
          </template>
        </Table>
      </LoadingCard>
    </div>
    <div class="col-12 col-md-7">
      <LoadingCard
        :loading="!charts"
        loading-height="402px"
        class="q-pa-md full-height"
        data-cy="donation-charts"
      >
        <template #title>
          {{ t('labels.donationsChartTitle') }}
          <div class="flex text-subtitle2 text-grey q-mt-sm">
            <div class="flex q-mr-xl">
              <span class="q-mr-sm q-mt-sm">{{ t('labels.groupBy') }}:</span>
              <Select v-model="chartModeOption" :options="chartModeOptions" />
            </div>
            <div class="flex">
              <span class="q-mr-sm q-mt-sm">{{ t('labels.value') }}:</span>
              <Select v-model="chartValueOption" :options="chartValueOptions" />
            </div>
          </div>
        </template>
        <div>
          <Bar
            :data="
              getChartData({
                items: charts![chartModeOption.id],
                value: chartValueOption.id,
                amountLabel: t('labels.amount'),
                countLabel: t('labels.numberOfDonations'),
              })
            "
            :options="
              getChartOptions({ value: chartValueOption.id, amountLabel: t('labels.amount') })
            "
          />
        </div>
      </LoadingCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type PropType } from 'vue'
import { useI18n } from '@/composables'

import { Bar } from 'vue-chartjs'

import FormattedCurrency from '@/components/FormattedCurrency.vue'
import FormattedDate from '@/components/FormattedDate.vue'
import LoadingCard from '@/components/LoadingCard.vue'
import Select from '@/components/ui/Select.vue'
import Table from '@/components/ui/Table.vue'

import { DonorLink } from '@/features/donors'

import { getChartOptions, getChartData } from '../helpers/chart'

import type { QTableColumn } from 'quasar'
import type { DashboardSummaries } from '@shared/models'

const { t } = useI18n()

defineProps({
  totalDonations: {
    type: Object as PropType<DashboardSummaries['totalDonations']>,
    default: undefined,
  },
  charts: {
    type: Object as PropType<DashboardSummaries['donationCharts']>,
    default: undefined,
  },
  currentWeekDonations: {
    type: Object as PropType<DashboardSummaries['currentWeekDonations']>,
    default: undefined,
  },
})

const chartModeOptions = computed<
  { id: keyof DashboardSummaries['donationCharts']; name: string }[]
>(() => [
  { id: 'organisations', name: t('nouns.organisation') },
  { id: 'donationTypes', name: t('nouns.donationType') },
  { id: 'paymentModes', name: t('nouns.paymentMode') },
])
const chartModeOption = ref<(typeof chartModeOptions.value)[number]>(chartModeOptions.value[0])

const chartValueOptions = computed<{ id: 'count' | 'amount'; name: string }[]>(() => [
  { id: 'count', name: t('labels.numberOfDonations') },
  { id: 'amount', name: t('labels.amount') },
])
const chartValueOption = ref<(typeof chartValueOptions.value)[number]>(chartValueOptions.value[0])

const currentWeekDonationColumns: QTableColumn[] = [
  { name: 'donor', required: true, label: t('nouns.donor'), align: 'left', field: 'donor' },
  {
    name: 'donatedAt',
    required: true,
    label: t('labels.donatedAt'),
    align: 'left',
    field: 'donatedAt',
  },
  { name: 'amount', required: true, label: t('labels.amount'), align: 'left', field: 'amount' },
]

const currentWeekDonationPagination = ref({
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 5,
})
</script>

<style lang="scss" scoped>
.q-card > div {
  border-radius: 10px;
}
</style>
