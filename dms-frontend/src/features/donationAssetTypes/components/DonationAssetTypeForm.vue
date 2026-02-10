<template>
  <div class="column">
    <FormField name="name" :label="t('common.name')" required>
      <Input id="name" v-model="name" :error="errors.name" v-bind="nameAttrs" />
    </FormField>
    <FormField name="isDefault" :label="t('labels.defaultValue')">
      <QCheckbox
        id="isDefault"
        v-model="isDefault"
        :error="errors.isDefault"
        v-bind="isDefaultAttrs"
        style="padding-bottom: 20px"
      />
    </FormField>
    <div
      v-if="!errors.isDefault"
      class="text-caption text-grey-7"
      style="margin-top: -28px; margin-left: 232px"
    >
      {{ t('labels.donationAssetTypeDefaultDescription') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { useI18n } from '@/composables'

import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { donationAssetTypeFormSchema } from '../schemas'

import FormField from '@/components/FormField.vue'
import Input from '@/components/ui/Input.vue'

import type { DonationAssetTypeFormData } from '../types'
import type { DonationAssetType } from '@shared/models'
import { QCheckbox } from 'quasar'

const { t } = useI18n()

const props = defineProps<{
  donationAssetType?: DonationAssetType
}>()

const emit = defineEmits<{
  (e: 'submit', formData: DonationAssetTypeFormData): void
}>()

const { defineField, errors, handleSubmit, resetForm, setErrors } = useForm({
  validationSchema: toTypedSchema(donationAssetTypeFormSchema),
  initialValues: props.donationAssetType
    ? {
        name: props.donationAssetType?.name,
        isDefault: props.donationAssetType?.isDefault,
      }
    : {
        isDefault: false,
      },
})

const [name, nameAttrs] = defineField('name')
const [isDefault, isDefaultAttrs] = defineField('isDefault')

const validate = handleSubmit((formData) => {
  emit('submit', formData)
})

defineExpose({ setErrors, validate })
onBeforeUnmount(() => resetForm())
</script>
