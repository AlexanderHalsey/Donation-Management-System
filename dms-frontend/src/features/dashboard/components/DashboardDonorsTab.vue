<template>
  <div class="row q-col-gutter-md">
    <div class="col-12 col-md-7">
      <LoadingCard
        :loading="!chartItems.length"
        :title="t('labels.topDonors')"
        class="full-height q-pa-md"
      >
        <template #title>
          {{ t('labels.topDonors') }} {{ t('prepositions.by').toLowerCase() }}
          {{ chartValueOption.name.toLowerCase() }}
          <div class="flex text-subtitle2 text-grey q-mt-sm">
            <span class="q-mr-sm q-mt-sm">{{ t('labels.value') }}:</span>
            <Select v-model="chartValueOption" :options="chartValueOptions" />
          </div>
        </template>
        <div>
          <Bar
            :data="
              getChartData({
                items: chartItems,
                value: chartValueOption.id,
                amountLabel: t('labels.amount'),
                countLabel: t('labels.numberOfDonations'),
              })
            "
            :options="
              getChartOptions({
                value: chartValueOption.id,
                amountLabel: t('labels.amount'),
                indexAxis: $q.screen.gt.sm ? 'y' : 'x',
              })
            "
          />
        </div>
      </LoadingCard>
    </div>
    <div class="col-12 col-md-5">
      <LoadingCard :loading="!disabledDonors" class="full-height q-pa-md" data-cy="disabled-donors">
        <template #title>
          {{ t('labels.disabledDonorsWithDonations') }}
          <span v-if="!!disabledDonors?.length" class="q-ml-xs">⚠️</span>
          <QTooltip
            v-if="!!disabledDonors?.length"
            :delay="300"
            :offset="[10, 10]"
            color
            class="bg-warning text-subtitle2"
            max-width="400px"
          >
            {{ t('labels.disabledDonorsTooltip') }}
          </QTooltip>
        </template>
        <Table
          :rows="disabledDonors ?? []"
          :columns="disabledDonorColumns"
          row-key="id"
          flat
          dense
          class="q-mt-md"
          v-model:pagination="disabledDonorsPagination"
          :rows-per-page-options="[]"
        >
          <template #body-cell-lastName="props">
            <QTd :props="props">
              <DonorLink :donor="props.row" />
            </QTd>
          </template>
          <template #body-cell-donationTotalAmount="props">
            <QTd :props="props">
              <FormattedCurrency :value="props.row.donationTotalAmount" />
            </QTd>
          </template>
        </Table>
      </LoadingCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type PropType } from 'vue'
import { useI18n } from '@/composables'

import { Bar } from 'vue-chartjs'
import { useQuasar, type QTableColumn } from 'quasar'

import FormattedCurrency from '@/components/FormattedCurrency.vue'
import LoadingCard from '@/components/LoadingCard.vue'
import Select from '@/components/ui/Select.vue'
import Table from '@/components/ui/Table.vue'

import { DonorLink } from '@/features/donors'

import { getChartData, getChartOptions } from '../helpers/chart'

import type { ChartItem, DonorListItem } from '@shared/models'

const { t } = useI18n()

const props = defineProps({
  topDonorsByAmount: {
    type: Array as PropType<DonorListItem[]>,
    default: undefined,
  },
  topDonorsByCount: {
    type: Array as PropType<DonorListItem[]>,
    default: undefined,
  },
  disabledDonors: {
    type: Array as PropType<DonorListItem[]>,
    default: undefined,
  },
})

const $q = useQuasar()

const chartValueOptions = computed<{ id: 'count' | 'amount'; name: string }[]>(() => [
  { id: 'amount', name: t('labels.amount') },
  { id: 'count', name: t('labels.numberOfDonations') },
])
const chartValueOption = ref<(typeof chartValueOptions.value)[number]>(chartValueOptions.value[0])

const chartItems = computed<ChartItem[]>(() => {
  const donors =
    chartValueOption.value.id === 'amount' ? props.topDonorsByAmount : props.topDonorsByCount
  if (!donors) return []
  return donors.map((donor) => ({
    name: `${donor.lastName}${donor.firstName ? ` ${donor.firstName[0]}` : ''}`,
    amount: donor.donationTotalAmount,
    count: donor.donationCount,
  }))
})

const disabledDonorColumns = computed<QTableColumn[]>(() => [
  {
    name: 'lastName',
    required: true,
    label: t('common.name'),
    align: 'left',
    field: 'lastName',
  },
  {
    name: 'donationCount',
    required: true,
    label: t('labels.numberOfDonations'),
    align: 'left',
    field: 'donationCount',
  },
  {
    name: 'donationTotalAmount',
    required: true,
    label: t('labels.totalAmount'),
    align: 'left',
    field: 'donationTotalAmount',
  },
])

const disabledDonorsPagination = ref({
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 10,
})
</script>

<style lang="scss" scoped>
.q-card > div {
  border-radius: 10px;
}
</style>
