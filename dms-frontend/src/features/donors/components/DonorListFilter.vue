<template>
  <BtnDropdown outline color="primary" icon="filter_alt" label="Filtres">
    <template #label>
      <QBadge v-if="filterCount" color="red-8" floating rounded>
        {{ filterCount }}
      </QBadge>
    </template>
    <div class="q-px-md q-py-sm">
      <div class="row justify-between items-center q-mb-lg">
        <div class="text-bold" style="font-size: 18px">Filtres des donateurs</div>
        <Btn flat size="md" color="primary" icon="refresh" @click="updateFilter()">
          Réinitialiser
        </Btn>
      </div>
      <div>
        <div class="text-bold q-mb-sm">Donateur</div>
        <UuidFilterComponent
          :model-value="filter?.id"
          :options="donorRefs.options"
          :lazy-load="donorRefs.load"
          @update:model-value="updateFilter({ ...filter, id: $event })"
        />
      </div>
      <QSeparator class="q-mt-xs q-mb-sm" />
      <div class="col">
        <div class="text-bold q-mb-sm">Date du don</div>
        <DateTimeFilterComponent
          :model-value="filter?.donatedAt"
          @update:model-value="updateFilter({ ...filter, donatedAt: $event })"
        />
      </div>
      <QSeparator class="q-mt-xs q-mb-sm" />
      <div class="col">
        <div class="text-bold q-mb-sm">Montant</div>
        <FloatFilterComponent
          :model-value="filter?.totalAmount"
          @update:model-value="updateFilter({ ...filter, totalAmount: $event })"
        />
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

import DateTimeFilterComponent from '@/components/DateTimeFilter.vue'
import FloatFilterComponent from '@/components/FloatFilter.vue'
import UuidFilterComponent from '@/components/UuidFilter.vue'

import type { LazySelectOptions } from '@/types'
import type { DonorListFilter, DonorRefSelect } from '@shared/models'

const props = defineProps({
  donorRefs: {
    type: Object as PropType<LazySelectOptions<DonorRefSelect>>,
    required: true,
  },
  filter: {
    type: Object as PropType<DonorListFilter>,
    default: undefined,
  },
})

const emit = defineEmits<{
  (e: 'update:filter', value: DonorListFilter | undefined): void
}>()

const updateFilter = debounce((newFilter?: DonorListFilter) => {
  const simplifyFilterForComparison = <T extends object>(obj: T): T | undefined => {
    const simplifiedObject = Object.entries(obj)
      .filter(([_, value]) => {
        if (typeof value === 'number' || isDate(value)) return true
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
      !!props.filter?.id?.in,
      !!props.filter?.donatedAt?.lte,
      !!props.filter?.donatedAt?.gte,
      !!props.filter?.totalAmount?.lte,
      !!props.filter?.totalAmount?.gte,
    ].filter(Boolean).length,
)
</script>
