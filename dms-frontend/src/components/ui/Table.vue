<template>
  <QTable
    v-bind="omit(props, ['pagination', 'rowsPerPageOptions'])"
    flat
    bordered
    class="dms-table"
    v-model:pagination="qTablePagination"
    :rows-per-page-options="qTableRowsPerPageOptions"
    @request="$emit('update:pagination', $event.pagination)"
  >
    <template v-for="(_, slot) of $slots" #[slot]="scope">
      <slot :name="slot" v-bind="scope || {}"></slot>
    </template>
  </QTable>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { omit, uniq } from 'es-toolkit'

import type { QTableProps } from 'quasar'

export type QTablePagination = Omit<
  Required<NonNullable<QTableProps['pagination']>>,
  'rowsNumber'
> & { rowsNumber?: number }

const props = defineProps<
  Omit<QTableProps, 'pagination'> & {
    pagination: QTablePagination
  }
>()

defineEmits<{
  'update:pagination': [pagination: QTablePagination]
}>()

const qTablePagination = ref<QTablePagination>(props.pagination)
const qTableRowsPerPageOptions = ref<number[]>(
  (() => {
    const initialOptions = [5, 10, 25, 50, 100]
    return uniq(initialOptions.concat(props.pagination.rowsPerPage))
      .sort((a, b) => a - b)
      .filter((option) => option <= (props.pagination.rowsNumber ?? props.rows?.length ?? 0))
      .concat(0) // 0 means 'All'
  })(),
)

watch(
  () => props.pagination,
  () => (qTablePagination.value = props.pagination),
)
</script>

<style lang="scss" scoped>
.dms-table {
  max-height: calc(100vh - 180px);
  border-radius: 10px;

  :deep() {
    thead {
      tr {
        height: 42px;

        th {
          font-size: 14px;
          position: sticky;
          z-index: 1;
          background-color: $grey-3;
        }
      }

      tr:first-child th {
        top: 0;
      }
    }

    &.q-table--loading thead tr:last-child th {
      top: 42px;
    }

    .q-table__bottom {
      height: 42px;
      min-height: unset;

      .q-table__control {
        height: 24px;
      }
    }
  }
}
</style>
