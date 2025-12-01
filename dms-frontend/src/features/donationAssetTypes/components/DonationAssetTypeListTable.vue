<template>
  <Table
    :rows="donationAssetTypeList"
    :columns="headers"
    v-model:pagination="pagination"
    row-key="id"
    data-cy="donation-asset-type-list-table"
  >
    <template #body-cell-isDefault="{ row }">
      <td class="text-center"><BooleanIcon :value="row.isDefault" /></td>
    </template>
    <template #body-cell-actions="{ row }">
      <td>
        <DonationAssetTypeListItemActions
          :donationAssetType="row"
          @delete:donationAssetType="$emit('delete:donationAssetType', $event)"
        />
      </td>
    </template>
  </Table>
</template>

<script setup lang="ts">
import { ref, type PropType } from 'vue'

import Table, { type QTablePagination } from '@/components/ui/Table.vue'

import BooleanIcon from '@/components/BooleanIcon.vue'

import DonationAssetTypeListItemActions from './DonationAssetTypeListItemActions.vue'

import type { QTableProps } from 'quasar'
import type { DonationAssetType } from '@shared/models'

defineProps({
  donationAssetTypeList: {
    type: Array as PropType<DonationAssetType[]>,
    required: true,
  },
})

defineEmits<{
  'delete:donationAssetType': [donationAssetTypeId: string]
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
    name: 'isDefault',
    label: 'Valeur par défaut',
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
