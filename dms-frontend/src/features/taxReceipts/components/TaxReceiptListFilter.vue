<template>
  <BtnDropdown outline color="primary" icon="filter_alt" label="Filtres">
    <template #label>
      <QBadge v-if="filterCount" color="red-8" rounded class="q-ml-sm">
        {{ filterCount }}
      </QBadge>
      <span v-else style="width: 26.5px"></span>
    </template>
    <div class="q-px-md q-py-sm">
      <div class="row justify-between items-center q-mb-lg">
        <div class="text-bold" style="font-size: 18px">Filtres des reçus fiscaux</div>
        <Btn flat size="md" color="primary" icon="refresh" @click="updateFilter()">
          Réinitialiser
        </Btn>
      </div>

      <div class="row">
        <div>
          <div class="text-bold q-mb-sm">Donateur</div>
          <SelectFilterComponent
            :model-value="filter?.donorId"
            :options="donors.options"
            :lazy-load="donors.load"
            @update:model-value="updateFilter({ ...filter, donorId: $event })"
          />
        </div>
        <QSeparator vertical class="q-mx-md" />
        <div>
          <div class="text-bold q-mb-sm">Type de reçu</div>
          <Select
            :model-value="taxReceiptTypeOption"
            :options="taxReceiptTypeOptions"
            rounded
            :input-debounce="0"
            style="width: 230px"
            @update:model-value="updateFilter({ ...filter, type: { equals: $event?.id } })"
          >
            <template #selected-item="scope">
              <QChip
                removable
                dense
                :tabindex="scope.tabindex"
                color="primary"
                text-color="white"
                class="q-pa-sm"
                @remove="scope.removeAtIndex(scope.index)"
              >
                <span class="ellipsis">{{ scope.opt.label }}</span>
              </QChip>
            </template>
            <template #option="scope">
              <QItem v-bind="scope.itemProps">
                <QItemSection>
                  <TaxReceiptTypeTag :tax-receipt-type="scope.opt.value" />
                </QItemSection>
              </QItem>
            </template>
          </Select>
        </div>
      </div>
      <QSeparator class="q-mt-xs q-mb-sm" />
      <div>
        <div class="text-bold q-mb-sm">Date de création</div>
        <DateTimeFilterComponent
          :model-value="filter?.createdAt"
          @update:model-value="updateFilter({ ...filter, createdAt: $event })"
        />
      </div>
      <QSeparator class="q-mt-xs q-mb-sm" />

      <div class="row">
        <div class="col">
          <div class="text-bold q-mb-sm">Statut du reçu</div>
          <SelectFilterComponent
            :model-value="filter?.status"
            :options="TAX_RECEIPT_STATUS_OPTIONS"
            multiple
            @update:model-value="updateFilter({ ...filter, status: $event })"
          >
            <template #option="scope">
              <QItem v-bind="scope.itemProps">
                <QItemSection>
                  <QItemLabel>{{ scope.opt.label }}</QItemLabel>
                </QItemSection>
                <QItemSection avatar>
                  <TaxReceiptStatusIcon :tax-receipt-status="scope.opt.value" />
                </QItemSection>
              </QItem>
            </template>
          </SelectFilterComponent>
        </div>
        <QSeparator vertical class="q-mx-md" />
        <div class="col"></div>
      </div>
    </div>
  </BtnDropdown>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'

import { debounce, isEqual } from 'es-toolkit'
import { isEmpty } from 'es-toolkit/compat'
import { isDate } from 'date-fns'

import BtnDropdown from '@/components/ui/BtnDropdown.vue'
import Btn from '@/components/ui/Btn.vue'
import Select from '@/components/ui/Select.vue'

import DateTimeFilterComponent from '@/components/DateTimeFilter.vue'
import SelectFilterComponent from '@/components/SelectFilter.vue'

import TaxReceiptStatusIcon from './TaxReceiptStatusIcon.vue'

import type { LazySelectOptions } from '@/types'
import type { TaxReceiptListFilter, DonorRefSelect, TaxReceiptType } from '@shared/models'
import { TAX_RECEIPT_STATUS_OPTIONS } from '@shared/constants'
import TaxReceiptTypeTag from './TaxReceiptTypeTag.vue'

const props = defineProps({
  donors: {
    type: Object as PropType<LazySelectOptions<DonorRefSelect>>,
    required: true,
  },
  filter: {
    type: Object as PropType<TaxReceiptListFilter>,
    default: undefined,
  },
})

const emit = defineEmits<{
  (e: 'update:filter', value: TaxReceiptListFilter | undefined): void
}>()

type TaxReceiptTypeSelect = {
  id: TaxReceiptType
  name: string
}
const taxReceiptTypeOptions = computed<TaxReceiptTypeSelect[]>(() => [
  { id: 'ANNUAL', name: 'Annuel' },
  { id: 'INDIVIDUAL', name: 'Individuel' },
])

const taxReceiptTypeOption = computed(() =>
  taxReceiptTypeOptions.value.find((option) => option.id === props.filter?.type?.equals),
)

const updateFilter = debounce((newFilter?: TaxReceiptListFilter) => {
  const simplifyFilterForComparison = <T extends object>(obj: T): T | undefined => {
    const simplifiedObject = Object.entries(obj)
      .filter(([_, value]) => {
        if (typeof value === 'boolean' || isDate(value)) return true
        return !isEmpty(typeof value === 'object' ? simplifyFilterForComparison(value) : value)
      })
      .reduce((acc, [key, value]) => {
        acc[key as keyof T] = value
        return acc
      }, {} as T)
    return isEmpty(simplifiedObject) ? undefined : simplifiedObject
  }

  const simplifiedFilter = newFilter && simplifyFilterForComparison(newFilter)
  if (isEqual(simplifiedFilter, props.filter)) return
  emit('update:filter', simplifiedFilter)
}, 300)

const filterCount = computed(
  () =>
    [
      !!props.filter?.donorId?.in,
      !!props.filter?.createdAt?.lte,
      !!props.filter?.createdAt?.gte,
      !!props.filter?.type?.equals,
      !!props.filter?.status?.in,
    ].filter(Boolean).length,
)
</script>
