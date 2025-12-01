<template>
  <Table
    :rows="paymentModeList"
    :columns="headers"
    v-model:pagination="pagination"
    row-key="id"
    data-cy="payment-mode-list-table"
  >
    <template #body-cell-actions="{ row }">
      <td>
        <PaymentModeListItemActions
          :paymentMode="row"
          @delete:paymentMode="$emit('delete:paymentMode', $event)"
        />
      </td>
    </template>
  </Table>
</template>

<script setup lang="ts">
import { ref, type PropType } from 'vue'

import Table, { type QTablePagination } from '@/components/ui/Table.vue'

import PaymentModeListItemActions from './PaymentModeListItemActions.vue'

import type { QTableProps } from 'quasar'
import type { PaymentMode } from '@shared/models'

defineProps({
  paymentModeList: {
    type: Array as PropType<PaymentMode[]>,
    required: true,
  },
})

defineEmits<{
  'delete:paymentMode': [paymentModeId: string]
}>()

const headers: QTableProps['columns'] = [
  {
    name: 'name',
    label: 'Nom',
    field: 'name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'actions',
    label: '',
    field: 'id',
    align: 'right',
    headerStyle: 'width: 50px',
    style: 'width: 50px',
  },
]

const pagination = ref<QTablePagination>({
  page: 1,
  rowsPerPage: 10,
  sortBy: 'name',
  descending: false,
})
</script>
