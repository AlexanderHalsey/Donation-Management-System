<template>
  <Table
    :rows="donationTypeList"
    :columns="headers"
    v-model:pagination="pagination"
    row-key="id"
    data-cy="donation-type-list-table"
  >
    <template #body-cell-organisation="{ row }">
      <td>
        <OrganisationTag
          :organisation="getOrganisationRefById(row.organisationId)"
          :organisation-options="organisationOptions"
        />
      </td>
    </template>
    <template #body-cell-actions="{ row }">
      <td>
        <DonationTypeListItemActions
          :donationType="row"
          @delete:donationType="$emit('delete:donationType', $event)"
        />
      </td>
    </template>
  </Table>
</template>

<script setup lang="ts">
import { ref, type PropType, computed } from 'vue'
import { useI18n } from '@/composables'

import Table, { type QTablePagination } from '@/components/ui/Table.vue'
import { OrganisationTag, getOrganisationRefById } from '@/features/organisations'

import DonationTypeListItemActions from './DonationTypeListItemActions.vue'

import type { QTableProps } from 'quasar'
import type { DonationType, OrganisationRef } from '@shared/models'

const { t } = useI18n()

defineProps({
  donationTypeList: {
    type: Array as PropType<DonationType[]>,
    required: true,
  },
  organisationOptions: {
    type: Array as PropType<OrganisationRef[]>,
    required: true,
  },
})

defineEmits<{
  'delete:donationType': [donationTypeId: string]
}>()

const headers = computed<QTableProps['columns']>(() => [
  {
    name: 'name',
    label: t('common.name'),
    field: 'name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'organisation',
    label: t('nouns.organisation'),
    field: 'organisationId',
    align: 'center',
    sortable: true,
    sort: (a, b, _, __) => {
      const orgA = getOrganisationRefById(a)
      const orgB = getOrganisationRefById(b)
      return orgA.name.localeCompare(orgB.name)
    },
    headerStyle: 'width: 240px',
    style: 'width: 240px',
  },
  {
    name: 'actions',
    label: '',
    field: 'actions',
    align: 'center',
    headerStyle: 'width: 50px',
    style: 'width: 50px',
  },
])

const pagination = ref<QTablePagination>({
  page: 1,
  rowsPerPage: 10,
  sortBy: 'name',
  descending: false,
})
</script>
