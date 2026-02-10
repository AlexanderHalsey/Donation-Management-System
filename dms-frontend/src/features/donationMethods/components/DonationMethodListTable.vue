<template>
  <Table
    :rows="donationMethodList"
    :columns="headers"
    v-model:pagination="pagination"
    row-key="id"
    data-cy="donation-method-list-table"
  >
    <template #body-cell-isDefault="{ row }">
      <td class="text-center"><BooleanIcon :value="row.isDefault" /></td>
    </template>
    <template #body-cell-actions="{ row }">
      <td>
        <DonationMethodListItemActions
          :donationMethod="row"
          @delete:donationMethod="$emit('delete:donationMethod', $event)"
        />
      </td>
    </template>
  </Table>
</template>

<script setup lang="ts">
import { ref, type PropType } from 'vue'
import { useI18n } from '@/composables'

import Table, { type QTablePagination } from '@/components/ui/Table.vue'

import BooleanIcon from '@/components/BooleanIcon.vue'

import DonationMethodListItemActions from './DonationMethodListItemActions.vue'

import type { QTableProps } from 'quasar'
import type { DonationMethod } from '@shared/models'

const { t } = useI18n()

defineProps({
  donationMethodList: {
    type: Array as PropType<DonationMethod[]>,
    required: true,
  },
})

defineEmits<{
  'delete:donationMethod': [donationMethodId: string]
}>()

const headers: QTableProps['columns'] = [
  {
    name: 'name',
    label: t('common.name'),
    field: 'name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'isDefault',
    label: t('labels.defaultValue'),
    field: 'isDefault',
    align: 'center',
    sortable: true,
    headerStyle: 'width: 150px',
    style: 'width: 150px',
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
