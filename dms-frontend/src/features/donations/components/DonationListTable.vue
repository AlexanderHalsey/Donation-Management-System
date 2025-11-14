<template>
  <Table
    :rows="donationList"
    :columns="headers"
    :pagination="computedPagination"
    :loading="loading"
    row-key="id"
    :table-row-class-fn="rowClassFn"
    class="donation-list-table"
    @update:pagination="updatePagination"
  >
    <template #body-cell-donor="{ row }">
      <td>{{ getDonorFullName(row.donor) }}</td>
    </template>
    <template #body-cell-donatedAt="{ row }">
      <td><FormattedDate :value="row.donatedAt" /></td>
    </template>
    <template #body-cell-amount="{ row }">
      <td>{{ row.amount.toFixed(2) }} €</td>
    </template>
    <template #body-cell-paymentMode="{ row }">
      <td>{{ row.paymentMode.name }}</td>
    </template>
    <template #body-cell-organisation="{ row }">
      <td>
        <OrganisationTag :organisation="row.organisation" :organisation-options="organisations" />
      </td>
    </template>
    <template #body-cell-donationType="{ row }">
      <td>{{ row.donationType.name }}</td>
    </template>
    <template #body-cell-actions="{ row }">
      <td>
        <DonationListItemActions v-if="!row.isDisabled || row.taxReceiptId" :donation="row" />
      </td>
    </template>
  </Table>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'

import { isEqual, omit } from 'es-toolkit'

import Table, { type QTablePagination } from '@/components/ui/Table.vue'
import FormattedDate from '@/components/FormattedDate.vue'

import { OrganisationTag } from '@/features/organisations'

import DonationListItemActions from './DonationListItemActions.vue'

import { DONATION_STATUS_OPTIONS } from '../helpers'
import { getDonorFullName } from '@/features/donors'

import type { QTableProps } from 'quasar'
import type {
  DonationListItem,
  DonationListPagination,
  DonationListPaginationRequest,
  DonationListSortOrder,
  OrganisationRef,
} from '@shared/models'

const props = defineProps({
  donationList: {
    type: Array as PropType<DonationListItem[]>,
    required: true,
  },
  pagination: {
    type: Object as PropType<DonationListPagination>,
    required: true,
  },
  organisations: {
    type: Array as PropType<OrganisationRef[]>,
    required: true,
  },
  loading: {
    type: Boolean,
    default: undefined,
  },
})

const emit = defineEmits<{
  'update:pagination': [pagination: DonationListPaginationRequest]
}>()

const headers: QTableProps['columns'] = [
  {
    name: 'donor',
    label: 'Donateur',
    field: 'donor',
    align: 'left',
    sortable: true,
  },
  {
    name: 'donatedAt',
    label: 'Date du don',
    field: 'donatedAt',
    align: 'left',
    sortable: true,
  },
  {
    name: 'amount',
    label: 'Montant',
    field: 'amount',
    align: 'left',
    sortable: true,
  },
  {
    name: 'paymentMode',
    label: 'Mode de paiement',
    field: 'paymentMode',
    align: 'left',
    sortable: true,
  },
  {
    name: 'organisation',
    label: 'Organisation',
    field: 'organisation',
    align: 'left',
    sortable: true,
  },
  {
    name: 'donationType',
    label: 'Type de don',
    field: 'donationType',
    align: 'left',
    sortable: true,
  },
  {
    name: 'actions',
    label: '',
    field: 'id',
    align: 'right',
  },
]

const rowClassFn = (row: DonationListItem) => {
  for (const option of DONATION_STATUS_OPTIONS) {
    if (option.predicate(row)) {
      return option.className
    }
  }
  return 'bg-white'
}

const computedPagination = computed<QTablePagination>(() => {
  const sortBy = Object.keys(props.pagination?.orderBy || {})[0]
  let orderByValue = Object.values(props.pagination?.orderBy || {})[0]
  if (typeof orderByValue === 'object') {
    orderByValue = Object.values(orderByValue)[0]
  }

  return {
    sortBy,
    descending: orderByValue === 'desc',
    page: props.pagination.page,
    rowsPerPage: props.pagination.pageSize,
    rowsNumber: props.pagination.totalCount,
  }
})

const updatePagination = ({
  page,
  sortBy,
  rowsPerPage,
  descending,
  rowsNumber,
}: QTablePagination) => {
  const paginationRequest: DonationListPaginationRequest = {
    page,
    pageSize: rowsPerPage || rowsNumber || 0,
    orderBy: sortBy
      ? ({
          [sortBy]: ['paymentMode', 'organisation', 'donationType'].includes(sortBy)
            ? { name: descending ? 'desc' : 'asc' }
            : sortBy === 'donor'
              ? { lastName: descending ? 'desc' : 'asc' }
              : descending
                ? 'desc'
                : 'asc',
        } as DonationListSortOrder)
      : undefined,
  }

  if (!isEqual(paginationRequest, omit(props.pagination, ['totalCount']))) {
    emit('update:pagination', paginationRequest)
  }
}
</script>

<style lang="scss" scoped>
.donation-list-table {
  :deep() {
    th:first-child {
      z-index: 2;
    }
    td:first-child {
      z-index: 1;
    }
    td:first-child,
    th:first-child {
      position: sticky;
      left: 0;
    }
  }
}
</style>
