<template>
  <BtnDropdown outline color="primary" icon="filter_alt" :label="t('common.filters')">
    <template #label>
      <QBadge v-if="filterCount" color="red-8" rounded class="q-ml-sm">
        {{ filterCount }}
      </QBadge>
      <span v-else style="width: 26.5px"></span>
    </template>
    <div class="q-px-md q-py-sm">
      <div class="row justify-between items-center q-mb-lg">
        <div class="text-bold" style="font-size: 18px">{{ t('labels.donorFilters') }}</div>
        <Btn flat size="md" color="primary" icon="refresh" @click="updateFilter()">
          {{ t('common.reset') }}
        </Btn>
      </div>
      <div class="row">
        <div class="col">
          <div class="text-bold q-mb-sm">{{ t('nouns.donor') }}</div>
          <SelectFilterComponent
            :model-value="filter?.id"
            :options="donorRefs.options"
            :lazy-load="donorRefs.load"
            @update:model-value="updateFilter({ ...filter, id: $event })"
          />
        </div>
        <div class="col">
          <div class="text-bold q-mb-sm">{{ t('common.disabled') }}</div>
          <YesNoCheckbox
            :model-value="filter?.isDisabled?.equals"
            @update:model-value="
              updateFilter({
                ...filter,
                isDisabled: { equals: $event },
              })
            "
          />
        </div>
      </div>
      <QSeparator class="q-mt-xs q-mb-sm" />
      <div class="col">
        <div class="text-bold q-mb-sm">{{ t('labels.donatedAt') }}</div>
        <DateTimeFilterComponent
          :model-value="filter?.donatedAt"
          @update:model-value="updateFilter({ ...filter, donatedAt: $event })"
        />
      </div>
      <QSeparator class="q-mt-xs q-mb-sm" />
      <div class="col">
        <div class="text-bold q-mb-sm">{{ t('labels.amount') }}</div>
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
import { useI18n } from '@/composables'

import { debounce, isEqual } from 'es-toolkit'
import { isEmpty } from 'es-toolkit/compat'
import { isDate } from 'date-fns'

import BtnDropdown from '@/components/ui/BtnDropdown.vue'
import Btn from '@/components/ui/Btn.vue'

import DateTimeFilterComponent from '@/components/DateTimeFilter.vue'
import FloatFilterComponent from '@/components/FloatFilter.vue'
import SelectFilterComponent from '@/components/SelectFilter.vue'
import YesNoCheckbox from '@/components/YesNoCheckbox.vue'

import type { LazySelectOptions } from '@/types'
import type { DonorListFilter, DonorRefSelect } from '@shared/models'

const { t } = useI18n()

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
        if (['number', 'boolean'].includes(typeof value) || isDate(value)) return true
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
      props.filter?.isDisabled?.equals !== undefined,
      !!props.filter?.donatedAt?.lte,
      !!props.filter?.donatedAt?.gte,
      !!props.filter?.totalAmount?.lte,
      !!props.filter?.totalAmount?.gte,
    ].filter(Boolean).length,
)
</script>
