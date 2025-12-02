<template>
  <Table
    :rows="organisationList"
    :columns="headers"
    v-model:pagination="pagination"
    row-key="id"
    data-cy="organisation-list-table"
  >
    <template #body-cell-name="{ row }">
      <td>
        <OrganisationTag
          :organisation="row"
          :organisation-options="organisationList"
          style="width: 240px"
        />
      </td>
    </template>
    <template #body-cell-actions="{ row }">
      <td>
        <OrganisationListItemActions
          :organisation="row"
          @delete:organisation="$emit('delete:organisation', $event)"
        />
      </td>
    </template>
  </Table>
</template>

<script setup lang="ts">
import { ref, type PropType } from 'vue'

import Table, { type QTablePagination } from '@/components/ui/Table.vue'

import OrganisationTag from './OrganisationTag.vue'
import OrganisationListItemActions from './OrganisationListItemActions.vue'

import type { QTableProps } from 'quasar'
import type { Organisation } from '@shared/models'

defineProps({
  organisationList: {
    type: Array as PropType<Organisation[]>,
    required: true,
  },
})

defineEmits<{
  'delete:organisation': [organisationId: string]
}>()

const headers: QTableProps['columns'] = [
  {
    name: 'name',
    label: 'Nom interne',
    field: 'name',
    align: 'left',
    sortable: true,
    headerStyle: 'padding-left: 100px;',
  },
  {
    name: 'title',
    label: 'Nom sur le reçu',
    field: 'title',
    align: 'left',
    sortable: true,
    style: 'width: 240px',
    headerStyle: 'width: 240px',
  },
  {
    name: 'locality',
    label: 'Ville',
    field: 'locality',
    align: 'left',
    sortable: true,
    headerStyle: 'width: 200px',
    style: 'width: 200px',
  },
  {
    name: 'actions',
    label: '',
    field: 'actions',
    align: 'center',
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
