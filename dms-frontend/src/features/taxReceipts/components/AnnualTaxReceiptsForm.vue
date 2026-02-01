<template>
  <div>
    <Table
      :rows="eligibleDonors"
      row-key="id"
      :loading="loading"
      :rows-per-page-options="[0]"
      :selected-rows-label="selectedRowsLabel"
      selection="multiple"
      :selected="donorIds"
      v-model:expanded="expanded"
    >
      <template #header="props">
        <QTr :props="props" class="annual-tax-receipt-headers">
          <QTh class="text-left">
            <QCheckbox
              :model-value="
                donorIds.length < eligibleDonors.length && donorIds.length > 0
                  ? null
                  : donorIds.length === eligibleDonors.length
              "
              @update:model-value="
                (value) => setFieldValue('donorIds', value ? eligibleDonors.map((c) => c.id) : [])
              "
              style="height: 10px"
              data-cy="select-all-checkbox"
            />
          </QTh>
          <QTh class="text-left">Donateur</QTh>
          <QTh class="text-left">Email</QTh>
          <QTh class="text-center">Nombre de dons</QTh>
          <QTh class="text-right">Montant total</QTh>
          <QTh class="text-right">
            <Btn
              size="sm"
              :icon="
                expanded.length === eligibleDonors.length ? 'arrow_drop_up' : 'arrow_drop_down'
              "
              @click="
                expanded =
                  expanded.length === eligibleDonors.length
                    ? []
                    : eligibleDonors.map((eligibleDonor) => eligibleDonor.id)
              "
              data-cy="expand-collapse-all-button"
            >
              Tout {{ expanded.length === eligibleDonors.length ? 'replier' : 'déplier' }}
            </Btn>
          </QTh>
        </QTr>
      </template>
      <template #body="props">
        <QTr
          :props="props"
          :class="props.expand ? 'no-border-bottom' : ''"
          data-cy="eligible-donor-row"
        >
          <QTd>
            <QCheckbox
              :model-value="donorIds.includes(props.row.id)"
              @update:model-value="setFieldValue('donorIds', xor(donorIds, [props.row.id]))"
          /></QTd>
          <QTd>{{ getDonorFullName(props.row) }}</QTd>
          <QTd :class="props.row.email ? '' : 'text-red-6'">{{
            props.row.email ?? 'Ce donateur n’a pas d’email'
          }}</QTd>
          <QTd class="text-center">{{ props.row.donationCount }}</QTd>
          <QTd class="text-right">
            <FormattedCurrency :value="props.row.donationTotalAmount" />
          </QTd>
          <QTd class="text-right">
            <Btn
              size="sm"
              flat
              :icon="props.expand ? 'arrow_drop_up' : 'arrow_drop_down'"
              @click="expanded = xor(expanded, [props.row.id])"
            >
              {{ props.expand ? 'Replier' : 'Déplier' }}
            </Btn>
          </QTd>
        </QTr>
        <QTr v-show="props.expand" :props="props" no-hover>
          <QTd colspan="100%">
            <DonorAddressCard :donor="props.row" flat data-cy="donor-address-card" />
            <QCard flat>
              <QCardSection>
                <div class="text-h6 q-mb-md flex items-center">
                  <QIcon name="volunteer_activism" class="q-mr-sm" />
                  Dons
                </div>
                <Table
                  :rows="props.row.donations"
                  :columns="donationTableHeaders"
                  :loading="loading"
                  row-key="id"
                  :rows-per-page-options="[0]"
                  class="q-my-md"
                  data-cy="donation-table"
                >
                  <template #body-cell-donatedAt="{ row }">
                    <QTd no-hover><FormattedDate :value="row.donatedAt" /></QTd>
                  </template>
                  <template #body-cell-amount="{ row }">
                    <QTd no-hover>{{ row.amount.toFixed(2) }} €</QTd>
                  </template>
                  <template #body-cell-paymentMode="{ row }">
                    <QTd no-hover>{{ row.paymentMode.name }}</QTd>
                  </template>
                  <template #body-cell-organisation="{ row }">
                    <QTd no-hover>
                      <OrganisationTag
                        :organisation="row.organisation"
                        :organisation-options="organisations"
                      />
                    </QTd>
                  </template>
                  <template #body-cell-donationType="{ row }">
                    <QTd no-hover>{{ row.donationType.name }}</QTd>
                  </template>
                </Table>
              </QCardSection>
            </QCard>
          </QTd>
        </QTr>
      </template>
    </Table>
    <AnnualTaxReceiptsDialog
      ref="annualTaxReceiptsDialog"
      :totalCreated="donorIds.length"
      :totalEmailsSent="selectedEligibleDonors.filter((c) => c.email).length"
      @create:annual-tax-receipts="emit('submit', { donorIds })"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, type PropType } from 'vue'

import { xor } from 'es-toolkit'

import Btn from '@/components/ui/Btn.vue'
import Table from '@/components/ui/Table.vue'

import FormattedCurrency from '@/components/FormattedCurrency.vue'
import FormattedDate from '@/components/FormattedDate.vue'

import { OrganisationTag } from '@/features/organisations'
import { DonorAddressCard, getDonorFullName } from '@/features/donors'

import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { annualTaxReceiptsFormSchema } from '../schemas'

import type { AnnualTaxReceiptsFormData } from '../types'
import type { EligibleTaxReceiptDonor, OrganisationRef } from '@shared/models'
import type { QTableProps } from 'quasar'
import AnnualTaxReceiptsDialog from './AnnualTaxReceiptsDialog.vue'

const props = defineProps({
  eligibleDonors: {
    type: Array as PropType<EligibleTaxReceiptDonor[]>,
    required: true,
  },
  organisations: {
    type: Array as PropType<OrganisationRef[]>,
    required: true,
  },
  loading: {
    type: Boolean,
    default: undefined,
  },
})

const emit = defineEmits<{
  (e: 'submit', formData: AnnualTaxReceiptsFormData): void
}>()

const annualTaxReceiptsDialog = ref<InstanceType<typeof AnnualTaxReceiptsDialog> | null>(null)

const selectedRowsLabel = (numSelected: number) => {
  return numSelected === 0
    ? 'Aucun donateur sélectionné'
    : numSelected === 1
      ? '1 donateur sélectionné'
      : `${numSelected} donateurs sélectionnés`
}

const donationTableHeaders: QTableProps['columns'] = [
  {
    name: 'donatedAt',
    label: 'Date du don',
    field: 'donatedAt',
    align: 'left',
    sortable: true,
  },
  {
    name: 'amount',
    label: 'Montant',
    field: 'amount',
    align: 'left',
    sortable: true,
  },
  {
    name: 'paymentMode',
    label: 'Mode de paiement',
    field: 'paymentMode',
    align: 'left',
    sortable: true,
  },
  {
    name: 'organisation',
    label: 'Organisation',
    field: 'organisation',
    align: 'left',
    sortable: true,
  },
  {
    name: 'donationType',
    label: 'Type de don',
    field: 'donationType',
    align: 'left',
    sortable: true,
  },
]

const { defineField, errors, handleSubmit, resetForm, setFieldValue } =
  useForm<AnnualTaxReceiptsFormData>({
    validationSchema: toTypedSchema(annualTaxReceiptsFormSchema),
    initialValues: {
      donorIds: [],
    },
  })

const [donorIds] = defineField('donorIds')

const selectedEligibleDonors = computed(() =>
  props.eligibleDonors.filter((eligibleDonor) => donorIds.value.includes(eligibleDonor.id)),
)

const errorMessage = computed(() => errors.value.donorIds)

const validate = handleSubmit(() => {
  annualTaxReceiptsDialog.value?.open()
})

const expanded = ref<string[]>([])

defineExpose({ errorMessage, validate })
onBeforeUnmount(() => resetForm())
</script>

<style lang="scss" scoped>
.dms-table {
  max-height: calc(100vh - 220px) !important;
}

.no-border-bottom {
  :deep() {
    .q-td {
      border-bottom-width: 0px;
    }
  }
}
.annual-tax-receipt-headers {
  th {
    z-index: 10 !important;
  }
}
</style>
