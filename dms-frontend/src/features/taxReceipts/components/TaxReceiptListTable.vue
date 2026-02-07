<template>
  <Table
    :rows="taxReceiptList"
    :columns="headers"
    :pagination="computedPagination"
    :loading="loading"
    row-key="id"
    no-data-label="Aucun element à afficher"
    data-cy="tax-receipt-list-table"
    @update:pagination="updatePagination"
  >
    <template #body-cell-donor="{ row }">
      <td><DonorLink :donor="row.donor" /></td>
    </template>
    <template #body-cell-createdAt="{ row }">
      <td><FormattedDate :value="row.createdAt" /></td>
    </template>
    <template #body-cell-type="{ row }">
      <td><TaxReceiptTypeTag :tax-receipt-type="row.type" /></td>
    </template>
    <template #body-cell-file="{ row }">
      <td>
        <Btn v-if="row.file" flat class="file-link" @click="viewFile(row.file)">{{
          row.file.name
        }}</Btn>
        <span v-else>-</span>
      </td>
    </template>
    <template #body-cell-status="{ row }">
      <td class="text-right"><TaxReceiptStatusIcon :tax-receipt-status="row.status" /></td>
    </template>
    <template #body-cell-actions="{ row }">
      <td class="text-center">
        <TaxReceiptListItemActions
          v-if="!row.taxReceiptId"
          :taxReceipt="row"
          :user-role="userRole"
          @cancel:taxReceipt="$emit('cancel:taxReceipt', $event)"
          @retry-failed:tax-receipt="$emit('retry-failed:tax-receipt', $event)"
        />
      </td>
    </template>
  </Table>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'

import { isEqual, omit } from 'es-toolkit'

import Btn from '@/components/ui/Btn.vue'
import Table, { type QTablePagination } from '@/components/ui/Table.vue'
import FormattedDate from '@/components/FormattedDate.vue'

import { DonorLink } from '@/features/donors'

import TaxReceiptStatusIcon from './TaxReceiptStatusIcon.vue'
import TaxReceiptTypeTag from './TaxReceiptTypeTag.vue'
import TaxReceiptListItemActions from './TaxReceiptListItemActions.vue'

import type { QTableProps } from 'quasar'
import type {
  TaxReceiptListItem,
  TaxReceiptListPagination,
  TaxReceiptListPaginationRequest,
  TaxReceiptListSortOrder,
  UserRole,
} from '@shared/models'
import type { CancelTaxReceiptFormData } from '../types'

const props = defineProps({
  taxReceiptList: {
    type: Array as PropType<TaxReceiptListItem[]>,
    required: true,
  },
  pagination: {
    type: Object as PropType<TaxReceiptListPagination>,
    required: true,
  },
  userRole: {
    type: String as PropType<UserRole | null>,
    default: undefined,
  },
  loading: {
    type: Boolean,
    default: undefined,
  },
})

const emit = defineEmits<{
  'update:pagination': [pagination: TaxReceiptListPaginationRequest]
  'cancel:taxReceipt': [formData: CancelTaxReceiptFormData]
  'retry-failed:tax-receipt': [taxReceipt: TaxReceiptListItem]
}>()

const headers: QTableProps['columns'] = [
  {
    name: 'receiptNumber',
    label: 'N°',
    field: 'receiptNumber',
    align: 'left',
    sortable: true,
    headerStyle: 'width: 80px;',
    style: 'width: 80px;',
  },
  {
    name: 'donor',
    label: 'Donateur',
    field: 'donor',
    align: 'left',
    sortable: true,
  },
  {
    name: 'createdAt',
    label: 'Date de création',
    field: 'createdAt',
    align: 'left',
    sortable: true,
    headerStyle: 'width: 100px;',
    style: 'width: 100px;',
  },
  {
    name: 'type',
    label: 'Type de reçu',
    field: 'type',
    align: 'left',
    sortable: true,
    headerStyle: 'width: 100px;',
    style: 'width: 100px;',
  },
  {
    name: 'file',
    label: 'Nom du fichier',
    field: 'file',
    align: 'left',
    sortable: true,
    headerStyle: 'width: 320px',
    style: 'width: 320px',
  },
  {
    name: 'status',
    label: '',
    field: 'status',
    align: 'right',
    headerStyle: 'width: 30px;',
    style: 'width: 30px;',
  },
  {
    name: 'actions',
    label: '',
    field: 'id',
    align: 'right',
    headerStyle: 'width: 30px',
    style: 'width: 30px',
  },
]

const computedPagination = computed<QTablePagination>(() => {
  const sortBy = Object.keys(props.pagination?.orderBy ?? {})?.[0] ?? null
  let orderByValue = Object.values(props.pagination?.orderBy ?? {})?.[0] ?? null
  if (typeof orderByValue === 'object' && orderByValue !== null) {
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
  const paginationRequest: TaxReceiptListPaginationRequest = {
    page,
    pageSize: rowsPerPage || rowsNumber || 0,
  }
  if (sortBy) {
    paginationRequest.orderBy = {
      [sortBy]:
        sortBy === 'file'
          ? { name: descending ? 'desc' : 'asc' }
          : sortBy === 'donor'
            ? { lastName: descending ? 'desc' : 'asc' }
            : descending
              ? 'desc'
              : 'asc',
    } as TaxReceiptListSortOrder
  }

  if (!isEqual(paginationRequest, omit(props.pagination, ['totalCount']))) {
    emit('update:pagination', paginationRequest)
  }
}

const viewFile = (file: { id: string; name: string }) => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
  window.open(`${apiBaseUrl}/files/${file.id}`, '_blank')
}
</script>

<style lang="scss" scoped>
:deep() {
  .file-link {
    text-decoration: none;
    color: $primary;
    padding: 0;
    min-height: unset;

    &:hover {
      text-decoration: underline;
    }

    &.q-hoverable:hover > .q-focus-helper {
      background: none;
    }
  }
}
</style>
