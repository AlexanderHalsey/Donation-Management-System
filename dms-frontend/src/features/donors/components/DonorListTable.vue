<template>
  <Table
    :rows="donorList"
    :columns="headers"
    :pagination="computedPagination"
    :loading="loading"
    row-key="id"
    @update:pagination="updatePagination"
  >
    <template #body-cell-lastName="{ row }">
      <td><DonorLink :donor="row" /></td>
    </template>
    <template #body-cell-email="{ row }">
      <td>{{ row.email ?? '-' }}</td>
    </template>
    <template #body-cell-donationCount="{ row }">
      <td class="text-center">{{ row.donationCount }}</td>
    </template>
    <template #body-cell-donationTotalAmount="{ row }">
      <td class="text-center"><FormattedCurrency :value="row.donationTotalAmount" /></td>
    </template>
    <template #body-cell-actions="{ row }">
      <td>
        <DonorListItemActions :donor="row" />
      </td>
    </template>
  </Table>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'

import { isEqual, omit } from 'es-toolkit'

import Table, { type QTablePagination } from '@/components/ui/Table.vue'
import FormattedCurrency from '@/components/FormattedCurrency.vue'

import DonorListItemActions from './DonorListItemActions.vue'
import DonorLink from './DonorLink.vue'

import type { QTableProps } from 'quasar'
import type { DonorListItem, DonorListPagination, DonorListPaginationRequest } from '@shared/models'

const props = defineProps({
  donorList: {
    type: Array as PropType<DonorListItem[]>,
    required: true,
  },
  pagination: {
    type: Object as PropType<DonorListPagination>,
    required: true,
  },
  loading: {
    type: Boolean,
    default: undefined,
  },
})

const emit = defineEmits<{
  'update:pagination': [pagination: DonorListPaginationRequest]
}>()

const headers: QTableProps['columns'] = [
  {
    name: 'lastName',
    label: 'Donateur',
    field: 'lastName',
    align: 'left',
    sortable: true,
  },
  {
    name: 'email',
    label: 'Email',
    field: 'email',
    align: 'left',
    sortable: true,
  },
  {
    name: 'donationCount',
    label: 'Nombre de dons',
    field: 'donationCount',
    align: 'left',
    sortable: true,
  },
  {
    name: 'donationTotalAmount',
    label: 'Montant total des dons',
    field: 'donationTotalAmount',
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
  const [sortBy, direction] = Object.entries(props.pagination?.orderBy ?? {})?.[0] || [null, null]

  return {
    sortBy,
    descending: direction === 'desc',
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
  const paginationRequest: DonorListPaginationRequest = {
    page,
    pageSize: rowsPerPage || rowsNumber || 0,
    orderBy: sortBy ? { [sortBy]: descending ? 'desc' : 'asc' } : {},
  }

  if (!isEqual(paginationRequest, omit(props.pagination, ['totalCount']))) {
    emit('update:pagination', paginationRequest)
  }
}
</script>
