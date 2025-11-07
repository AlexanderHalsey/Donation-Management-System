<template>
  <Table
    :rows="donationList"
    :columns="headers"
    :pagination="computedPagination"
    :loading="loading"
    row-key="id"
    class="donation-list-table"
    @update:pagination="updatePagination"
  >
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
        <OrganisationTag
          :organisation="row.organisation"
          :organisationOptions="organisationOptions"
        />
      </td>
    </template>
    <template #body-cell-donationType="{ row }">
      <td>{{ row.donationType.name }}</td>
    </template>
    <template #body-cell-actions="{ row }">
      <td>
        <DonationListActions :donation="row" />
      </td>
    </template>
  </Table>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'

import { uniqBy } from 'es-toolkit'

import Table, { type QTablePagination } from '@/components/ui/Table.vue'
import FormattedDate from '@/components/FormattedDate.vue'
import OrganisationTag from '@/components/OrganisationTag.vue'
import DonationListActions from './DonationListActions.vue'

import type { QTableProps } from 'quasar'
import type { OrganisationSummary, Donation, DonationSortOrder, Pagination } from '@shared/models'

const props = defineProps({
  donationList: {
    type: Array as PropType<Donation[]>,
    required: true,
  },
  pagination: {
    type: Object as PropType<Pagination<DonationSortOrder>>,
    default: undefined,
  },
  loading: {
    type: Boolean,
    default: undefined,
  },
})

const emit = defineEmits<{
  'update:pagination': [pagination: Pagination<DonationSortOrder>]
}>()

const headers: QTableProps['columns'] = [
  {
    name: 'contactId',
    label: 'Contact',
    field: 'contactId',
    align: 'left',
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

const computedPagination = computed<QTablePagination>(() => {
  const sortBy = Object.keys(props.pagination?.orderBy || {})[0]
  let orderByValue = Object.values(props.pagination?.orderBy || {})[0]
  if (typeof orderByValue === 'object') {
    orderByValue = Object.values(orderByValue)[0]
  }

  return {
    sortBy,
    descending: orderByValue === 'desc',
    page: props.pagination?.page || 1,
    rowsPerPage: props.pagination?.pageSize || 10,
    rowsNumber: props.pagination?.totalCount || 0,
  }
})

const updatePagination = ({
  page,
  sortBy,
  rowsPerPage,
  descending,
  rowsNumber,
}: QTablePagination) => {
  emit('update:pagination', {
    page,
    pageSize: rowsPerPage || rowsNumber || 0,
    totalCount: rowsNumber || 0,
    orderBy: sortBy
      ? ({
          [sortBy]: ['paymentMode', 'organisation', 'donationType'].includes(sortBy)
            ? { name: descending ? 'desc' : 'asc' }
            : descending
              ? 'desc'
              : 'asc',
        } as DonationSortOrder)
      : undefined,
  })
}

const organisationOptions = computed<OrganisationSummary[]>(() =>
  uniqBy(
    props.donationList
      .map((donation) => donation.organisation)
      .sort((a, b) => a.name.localeCompare(b.name)),
    (org) => org.id,
  ),
)
</script>

<style lang="scss" scoped>
.donation-list-table {
  :deep() {
    th:first-child {
      z-index: 2;
    }
    td:first-child {
      z-index: 1;
      background-color: white;
    }
    td:first-child,
    th:first-child {
      position: sticky;
      left: 0;
    }
  }
}
</style>
