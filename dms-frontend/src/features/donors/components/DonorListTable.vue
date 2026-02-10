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
      <td class="text-right"><FormattedCurrency :value="row.donationTotalAmount" /></td>
    </template>
    <template v-if="isDonorExternalProviderEnabled" #body-cell-actions="{ row }">
      <td>
        <DonorListItemActions :donor="row" />
      </td>
    </template>
  </Table>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'
import { useI18n } from '@/composables'

import { isEqual, omit } from 'es-toolkit'

import Table, { type QTablePagination } from '@/components/ui/Table.vue'
import FormattedCurrency from '@/components/FormattedCurrency.vue'

import DonorListItemActions from './DonorListItemActions.vue'
import DonorLink from './DonorLink.vue'

import type { QTableProps } from 'quasar'
import type { DonorListItem, DonorListPagination, DonorListPaginationRequest } from '@shared/models'

const { t } = useI18n()

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

const isDonorExternalProviderEnabled =
  import.meta.env.VITE_DONOR_EXTERNAL_PROVIDER_ENABLED === 'true'

const headers: QTableProps['columns'] = [
  {
    name: 'lastName',
    label: t('nouns.donor'),
    field: 'lastName',
    align: 'left',
    sortable: true,
  },
  {
    name: 'email',
    label: t('labels.email'),
    field: 'email',
    align: 'left',
    sortable: true,
    headerStyle: 'width: 300px',
  },
  {
    name: 'donationCount',
    label: t('labels.numberOfDonations'),
    field: 'donationCount',
    align: 'center',
    sortable: true,
    headerStyle: 'width: 100px',
  },
  {
    name: 'donationTotalAmount',
    label: t('labels.totalAmount'),
    field: 'donationTotalAmount',
    align: 'right',
    sortable: true,
    headerStyle: 'width: 180px',
  },
  ...(isDonorExternalProviderEnabled
    ? [
        {
          name: 'actions',
          label: '',
          field: 'id',
          align: 'right',
          headerStyle: 'width: 50px',
        } satisfies NonNullable<QTableProps['columns']>[number],
      ]
    : []),
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
