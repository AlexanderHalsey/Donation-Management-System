<template>
  <BtnDropdown outline color="primary" icon="filter_alt" label="Filtres">
    <template #label>
      <QBadge v-if="filterCount" color="red-8" floating rounded>
        {{ filterCount }}
      </QBadge>
    </template>
    <div class="q-px-md q-py-sm">
      <div class="row justify-between items-center q-mb-lg">
        <div class="text-bold" style="font-size: 18px">Filtres des dons</div>
        <Btn
          flat
          size="md"
          color="primary"
          icon="refresh"
          @click="updateFilter({ isDisabled: { equals: false } })"
        >
          Réinitialiser
        </Btn>
      </div>
      <!-- TODO add contact filter -->
      <div>
        <div class="text-bold q-mb-sm">Date du don</div>
        <DateTimeFilterComponent
          :model-value="filter?.donatedAt"
          @update:model-value="updateFilter({ ...filter, donatedAt: $event })"
        />
      </div>
      <QSeparator class="q-mt-xs q-mb-sm" />
      <div>
        <div class="text-bold q-mb-sm">Montant</div>
        <FloatFilterComponent
          :model-value="filter?.amount"
          @update:model-value="updateFilter({ ...filter, amount: $event })"
        />
      </div>
      <QSeparator class="q-mt-xs q-mb-sm" />
      <div class="row">
        <div class="col">
          <div>
            <div class="text-bold q-mb-sm">Organisation</div>
            <UuidFilterComponent
              :model-value="filter?.organisationId"
              @update:model-value="updateFilter({ ...filter, organisationId: $event })"
              :options="context.organisations"
            >
              <template #option="scope">
                <QItem v-bind="scope.itemProps" active-class="bg-blue-grey-1">
                  <QItemSection>
                    <OrganisationTag
                      :organisation="getOrganisationById(scope.opt.value)"
                      :organisation-options="context.organisations"
                    />
                  </QItemSection>
                </QItem>
              </template>
            </UuidFilterComponent>
          </div>
          <QSeparator class="q-mt-xs q-mb-sm" />
          <div>
            <div class="text-bold q-mb-sm">Mode de paiement</div>
            <UuidFilterComponent
              :model-value="filter?.paymentModeId"
              @update:model-value="updateFilter({ ...filter, paymentModeId: $event })"
              :options="context.paymentModes"
            >
              <template #option="scope">
                <QItem v-bind="scope.itemProps" active-class="bg-blue-grey-1">
                  <QItemSection>
                    <QItemLabel>{{ scope.opt.label }}</QItemLabel>
                  </QItemSection>
                </QItem>
              </template>
            </UuidFilterComponent>
          </div>
        </div>
        <QSeparator vertical class="q-mx-md" />
        <div class="col">
          <div>
            <div class="text-bold q-mb-sm">Type de don</div>
            <UuidFilterComponent
              :model-value="filter?.donationTypeId"
              @update:model-value="updateFilter({ ...filter, donationTypeId: $event })"
              :options="context.donationTypes"
            >
              <template #option="scope">
                <QItem v-bind="scope.itemProps" active-class="bg-blue-grey-1">
                  <QItemSection>
                    <QItemLabel>{{ scope.opt.label }}</QItemLabel>
                    <QItemLabel caption class="flex items-center">
                      Organisation :
                      <OrganisationTag
                        :organisation="getOrganisationByDonationTypeId(scope.opt.value)"
                        :organisation-options="context.organisations"
                        class="q-ml-xs"
                      />
                    </QItemLabel>
                  </QItemSection>
                </QItem>
              </template>
            </UuidFilterComponent>
          </div>
          <QSeparator class="q-mt-xs q-mb-sm" />
          <div>
            <div class="text-bold q-mb-sm">Inclure les dons supprimés</div>
            <QToggle
              :model-value="filter?.isDisabled?.equals === false ? false : true"
              @update:model-value="
                updateFilter({ ...filter, isDisabled: { equals: $event ? undefined : false } })
              "
            />
          </div>
        </div>
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
import OrganisationTag from '@/components/OrganisationTag.vue'

import DateTimeFilterComponent from '@/components/DateTimeFilter.vue'
import FloatFilterComponent from '@/components/FloatFilter.vue'
import UuidFilterComponent from '@/components/UuidFilter.vue'

import type {
  DonationListFilter,
  DonationType,
  OrganisationSummary,
  PaymentMode,
} from '@shared/models'

const props = defineProps({
  context: {
    type: Object as PropType<{
      paymentModes: PaymentMode[]
      organisations: OrganisationSummary[]
      donationTypes: DonationType[]
    }>,
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

const updateFilter = debounce((newFilter: DonationListFilter) => {
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

  const simplifiedFilter = simplifyFilterForComparison(newFilter)
  if (isEqual(simplifiedFilter, props.filter)) return
  emit('update:filter', simplifiedFilter)
}, 300)

const getOrganisationById = (id: string): OrganisationSummary => {
  const organisation = props.context.organisations.find((org) => org.id === id)
  if (!organisation) throw new Error(`Organisation with id ${id} not found`)
  return organisation
}
const getOrganisationByDonationTypeId = (id: string): OrganisationSummary => {
  const donationType = props.context.donationTypes.find((dt) => dt.id === id)
  if (!donationType) throw new Error(`Donation type with id ${id} not found`)
  return getOrganisationById(donationType.organisationId)
}

const filterCount = computed(
  () =>
    [
      !!props.filter?.donatedAt?.lte,
      !!props.filter?.donatedAt?.gte,
      !!props.filter?.amount?.lte,
      !!props.filter?.amount?.gte,
      !!props.filter?.organisationId?.in,
      !!props.filter?.paymentModeId?.in,
      !!props.filter?.donationTypeId?.in,
      !props.filter?.isDisabled,
    ].filter(Boolean).length,
)
</script>
