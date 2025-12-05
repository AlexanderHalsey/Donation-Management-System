<template>
  <BtnDropdown outline color="primary" icon="filter_alt" label="Filtres">
    <template #label>
      <QBadge v-if="filterCount" color="red-8" floating rounded>
        {{ filterCount }}
      </QBadge>
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
          <UuidFilterComponent
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
          <div class="text-bold q-mb-sm">Reçus annulés</div>
          <YesNoCheckbox
            :model-value="filter?.isCanceled?.equals"
            @update:model-value="
              updateFilter({
                ...filter,
                isCanceled: { equals: $event },
              })
            "
          />
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
import UuidFilterComponent from '@/components/UuidFilter.vue'
import YesNoCheckbox from '@/components/YesNoCheckbox.vue'

import type { LazySelectOptions } from '@/types'
import type { TaxReceiptListFilter, DonorRefSelect, TaxReceiptType } from '@shared/models'

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
  { id: 'annual', name: 'Annuel' },
  { id: 'individual', name: 'Individuel' },
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
      props.filter?.isCanceled?.equals !== undefined,
    ].filter(Boolean).length,
)
</script>
