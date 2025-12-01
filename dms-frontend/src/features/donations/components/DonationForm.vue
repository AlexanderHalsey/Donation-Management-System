<template>
  <div class="column">
    <FormField name="donorId" label="Donatateur">
      <Select
        :id="'donorId'"
        :model-value="donor"
        :options="props.donorOptions"
        :error="errors.donorId"
        v-bind="donorIdAttrs"
        use-input
        :input-debounce="0"
        clearable
        @update:model-value="updateDonor"
      />
    </FormField>
    <FormField name="donatedAt" label="Date du don">
      <DatePickerInput
        :id="'donatedAt'"
        v-model="donatedAt"
        :error="errors.donatedAt"
        v-bind="donatedAtAttrs"
      />
    </FormField>
    <FormField name="amount" label="Montant">
      <CurrencyInput :id="'amount'" v-model="amount" :error="errors.amount" v-bind="amountAttrs" />
    </FormField>
    <FormField name="organisationId" label="Organisation">
      <Select
        :id="'organisationId'"
        :model-value="organisation"
        :options="props.organisationOptions"
        :error="errors.organisationId"
        v-bind="organisationIdAttrs"
        use-input
        :input-debounce="0"
        clearable
        @update:model-value="updateOrganisation"
      >
        <template #option="scope">
          <QItem v-bind="scope.itemProps" active-class="bg-blue-grey-1">
            <QItemSection>
              <OrganisationTag
                :organisation="getOrganisationRefById(scope.opt.value)"
                :organisation-options="props.organisationOptions"
              />
            </QItemSection>
          </QItem>
        </template>
      </Select>
    </FormField>
    <FormField name="donationTypeId" label="Type de don">
      <Select
        :id="'donationTypeId'"
        :model-value="donationType"
        :options="props.donationTypeOptions"
        :error="errors.donationTypeId"
        v-bind="donationTypeIdAttrs"
        use-input
        :input-debounce="0"
        clearable
        @update:model-value="updateDonationType"
      >
        <template #option="scope">
          <QItem v-bind="scope.itemProps" active-class="bg-blue-grey-1">
            <QItemSection>
              <QItemLabel>{{ scope.opt.label }}</QItemLabel>
              <QItemLabel caption class="flex items-center">
                Organisation :
                <OrganisationTag
                  :organisation="getOrganisationRefByDonationTypeId(scope.opt.value)"
                  :organisation-options="props.organisationOptions"
                  class="q-ml-xs"
                />
              </QItemLabel>
            </QItemSection>
          </QItem>
        </template>
      </Select>
    </FormField>
    <FormField name="paymentModeId" label="Mode de paiement">
      <Select
        :id="'paymentModeId'"
        :model-value="paymentMode"
        :options="props.paymentModeOptions"
        :error="errors.paymentModeId"
        v-bind="paymentModeIdAttrs"
        use-input
        :input-debounce="0"
        clearable
        @update:model-value="updatePaymentMode"
      />
    </FormField>
    <FormField name="donationMethodId" label="Forme de don">
      <Select
        :id="'donationMethodId'"
        :model-value="donationMethod"
        :options="props.donationMethodOptions"
        :error="errors.donationMethodId"
        v-bind="donationMethodIdAttrs"
        use-input
        :input-debounce="0"
        clearable
        @update:model-value="updateDonationMethod"
      />
    </FormField>
    <FormField name="donationAssetTypeId" label="Nature du don">
      <Select
        :id="'donationAssetTypeId'"
        :model-value="donationAssetType"
        :options="props.donationAssetTypeOptions"
        :error="errors.donationAssetTypeId"
        v-bind="donationAssetTypeIdAttrs"
        use-input
        :input-debounce="0"
        clearable
        @update:model-value="updateDonationAssetType"
      />
    </FormField>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, computed } from 'vue'

import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { getDonationFormSchema } from '../schemas'

import FormField from '@/components/FormField.vue'
import DatePickerInput from '@/components/ui/DatePickerInput.vue'
import CurrencyInput from '@/components/ui/CurrencyInput.vue'
import Select from '@/components/ui/Select.vue'

import {
  getOrganisationRefByDonationTypeId,
  getOrganisationRefById,
  OrganisationTag,
} from '@/features/organisations'

import type { DonationFormData } from '../types'
import type {
  Donation,
  DonationAssetType,
  DonationMethod,
  DonationType,
  DonorRefSelect,
  OrganisationRef,
  PaymentMode,
} from '@shared/models'

const props = defineProps<{
  donorOptions: DonorRefSelect[]
  paymentModeOptions: PaymentMode[]
  organisationOptions: OrganisationRef[]
  donationTypeOptions: DonationType[]
  donationMethodOptions: DonationMethod[]
  donationAssetTypeOptions: DonationAssetType[]
  donation?: Donation
}>()

const emit = defineEmits<{
  (e: 'submit', formData: DonationFormData): void
}>()

const { defineField, errors, handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(getDonationFormSchema(props.donationTypeOptions)),
  initialValues: props.donation
    ? {
        donorId: props.donation.donor.id,
        donatedAt: props.donation.donatedAt,
        amount: props.donation.amount,
        organisationId: props.donation.organisation.id,
        donationTypeId: props.donation.donationType.id,
        paymentModeId: props.donation.paymentMode.id,
        donationMethodId: props.donation.donationMethod.id,
        donationAssetTypeId: props.donation.donationAssetType.id,
      }
    : {
        donationMethodId: props.donationMethodOptions.find(
          (donationMethod) => donationMethod.isDefault,
        )?.id,
        donationAssetTypeId: props.donationAssetTypeOptions.find(
          (donationAssetType) => donationAssetType.isDefault,
        )?.id,
      },
})

const [donorId, donorIdAttrs] = defineField('donorId')
const donor = computed(() => props.donorOptions.find((d) => d.id === donorId.value))
const updateDonor = (newDonor?: DonorRefSelect) => {
  donorId.value = newDonor?.id
}

const [donatedAt, donatedAtAttrs] = defineField('donatedAt')
const [amount, amountAttrs] = defineField('amount')
const [organisationId, organisationIdAttrs] = defineField('organisationId')
const organisation = computed(() =>
  props.organisationOptions.find((o) => o.id === organisationId.value),
)
const updateOrganisation = (newOrganisation?: OrganisationRef) => {
  organisationId.value = newOrganisation?.id
}

const [donationTypeId, donationTypeIdAttrs] = defineField('donationTypeId')
const donationType = computed(() =>
  props.donationTypeOptions.find((dt) => dt.id === donationTypeId.value),
)
const updateDonationType = (newDonationType?: DonationType) => {
  donationTypeId.value = newDonationType?.id
}

const [paymentModeId, paymentModeIdAttrs] = defineField('paymentModeId')
const paymentMode = computed(() =>
  props.paymentModeOptions.find((pm) => pm.id === paymentModeId.value),
)
const updatePaymentMode = (newPaymentMode?: PaymentMode) => {
  paymentModeId.value = newPaymentMode?.id
}

const [donationMethodId, donationMethodIdAttrs] = defineField('donationMethodId')
const donationMethod = computed(() =>
  props.donationMethodOptions.find((dm) => dm.id === donationMethodId.value),
)
const updateDonationMethod = (newDonationMethod?: DonationMethod) => {
  donationMethodId.value = newDonationMethod?.id
}

const [donationAssetTypeId, donationAssetTypeIdAttrs] = defineField('donationAssetTypeId')
const donationAssetType = computed(() =>
  props.donationAssetTypeOptions.find((dat) => dat.id === donationAssetTypeId.value),
)
const updateDonationAssetType = (newDonationAssetType?: DonationAssetType) => {
  donationAssetTypeId.value = newDonationAssetType?.id
}

const validate = handleSubmit((formData) => {
  emit('submit', formData)
})

defineExpose({ validate })
onBeforeUnmount(() => resetForm())
</script>
