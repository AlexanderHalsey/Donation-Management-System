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
        <div class="text-bold" style="font-size: 18px">{{ t('labels.donationFilters') }}</div>
        <Btn flat size="md" color="primary" icon="refresh" @click="updateFilter()">
          {{ t('common.reset') }}
        </Btn>
      </div>

      <div class="row">
        <div class="col-4">
          <div>
            <div class="text-bold q-mb-sm">{{ t('nouns.donor') }}</div>
            <SelectFilterComponent
              :model-value="filter?.donor?.id"
              :options="donors.options"
              :lazy-load="donors.load"
              @update:model-value="
                updateFilter({ ...filter, donor: { ...filter?.donor, id: $event } })
              "
            />
          </div>
          <QSeparator class="q-mt-xs q-mb-sm" />
          <div>
            <div class="text-bold q-mb-sm">{{ t('nouns.paymentMode') }}</div>
            <SelectFilterComponent
              :model-value="filter?.paymentModeId"
              :options="paymentModes.options"
              :lazy-load="paymentModes.load"
              @update:model-value="updateFilter({ ...filter, paymentModeId: $event })"
            >
              <template #option="scope">
                <QItem v-bind="scope.itemProps" active-class="bg-blue-grey-1">
                  <QItemSection>
                    <QItemLabel>{{ scope.opt.label }}</QItemLabel>
                  </QItemSection>
                </QItem>
              </template>
            </SelectFilterComponent>
          </div>
          <QSeparator class="q-mt-xs q-mb-sm" />
          <div>
            <div class="text-bold q-mb-sm">{{ t('nouns.organisation') }}</div>
            <SelectFilterComponent
              :model-value="filter?.organisationId"
              @update:model-value="updateFilter({ ...filter, organisationId: $event })"
              :options="organisations"
            >
              <template #option="scope">
                <QItem v-bind="scope.itemProps" active-class="bg-blue-grey-1">
                  <QItemSection>
                    <OrganisationTag
                      :organisation="getOrganisationRefById(scope.opt.value)"
                      :organisation-options="organisations"
                    />
                  </QItemSection>
                </QItem>
              </template>
            </SelectFilterComponent>
          </div>
        </div>
        <QSeparator vertical class="q-mx-md" />
        <div class="col" style="width: 510px">
          <div>
            <div class="text-bold q-mb-sm">{{ t('labels.donatedAt') }}</div>
            <DateTimeFilterComponent
              :model-value="filter?.donatedAt"
              @update:model-value="updateFilter({ ...filter, donatedAt: $event })"
            />
          </div>
          <QSeparator class="q-mt-xs q-mb-sm" />
          <div>
            <div class="text-bold q-mb-sm">{{ t('labels.amount') }}</div>
            <FloatFilterComponent
              :model-value="filter?.amount"
              @update:model-value="updateFilter({ ...filter, amount: $event })"
            />
          </div>
          <QSeparator class="q-mt-xs q-mb-sm" />
          <div class="row">
            <div>
              <div class="text-bold q-mb-sm">{{ t('nouns.donationType') }}</div>
              <SelectFilterComponent
                :model-value="filter?.donationTypeId"
                :options="donationTypes.options"
                :lazy-load="donationTypes.load"
                @update:model-value="updateFilter({ ...filter, donationTypeId: $event })"
              >
                <template #option="scope">
                  <QItem v-bind="scope.itemProps" active-class="bg-blue-grey-1">
                    <QItemSection>
                      <QItemLabel>{{ scope.opt.label }}</QItemLabel>
                      <QItemLabel caption class="flex items-center">
                        {{ t('nouns.organisation') }} :
                        <OrganisationTag
                          :organisation="getOrganisationRefByDonationTypeId(scope.opt.value)"
                          :organisation-options="organisations"
                          class="q-ml-xs"
                        />
                      </QItemLabel>
                    </QItemSection>
                  </QItem>
                </template>
              </SelectFilterComponent>
            </div>
            <QSeparator vertical class="q-mx-md" />
            <div>
              <div class="text-bold q-mb-sm">{{ t('labels.disabledDonors') }}</div>
              <YesNoCheckbox
                :model-value="filter?.donor?.isDisabled?.equals"
                @update:model-value="
                  updateFilter({
                    ...filter,
                    donor: { ...filter?.donor, isDisabled: { equals: $event } },
                  })
                "
              />
            </div>
          </div>
        </div>
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

import {
  getOrganisationRefByDonationTypeId,
  getOrganisationRefById,
  OrganisationTag,
} from '@/features/organisations'

import BtnDropdown from '@/components/ui/BtnDropdown.vue'
import Btn from '@/components/ui/Btn.vue'

import DateTimeFilterComponent from '@/components/DateTimeFilter.vue'
import FloatFilterComponent from '@/components/FloatFilter.vue'
import SelectFilterComponent from '@/components/SelectFilter.vue'
import YesNoCheckbox from '@/components/YesNoCheckbox.vue'

import type { LazySelectOptions } from '@/types'
import type {
  DonationListFilter,
  DonationType,
  DonorRefSelect,
  OrganisationRef,
  PaymentMode,
} from '@shared/models'

const { t } = useI18n()

const props = defineProps({
  organisations: {
    type: Object as PropType<OrganisationRef[]>,
    required: true,
  },
  donationTypes: {
    type: Object as PropType<LazySelectOptions<DonationType>>,
    required: true,
  },
  paymentModes: {
    type: Object as PropType<LazySelectOptions<PaymentMode>>,
    required: true,
  },
  donors: {
    type: Object as PropType<LazySelectOptions<DonorRefSelect>>,
    required: true,
  },
  filter: {
    type: Object as PropType<DonationListFilter>,
    default: undefined,
  },
})

const emit = defineEmits<{
  (e: 'update:filter', value: DonationListFilter | undefined): void
}>()

const updateFilter = debounce((newFilter?: DonationListFilter) => {
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
      !!props.filter?.donor?.id?.in,
      !!props.filter?.donatedAt?.lte,
      !!props.filter?.donatedAt?.gte,
      !!props.filter?.amount?.lte,
      !!props.filter?.amount?.gte,
      !!props.filter?.organisationId?.in,
      !!props.filter?.paymentModeId?.in,
      !!props.filter?.donationTypeId?.in,
      props.filter?.donor?.isDisabled?.equals !== undefined,
    ].filter(Boolean).length,
)
</script>
