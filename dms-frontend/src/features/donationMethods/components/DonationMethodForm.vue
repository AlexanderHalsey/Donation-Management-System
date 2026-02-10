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
      {{ t('labels.donationMethodDefaultDescription') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { useI18n } from '@/composables'

import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { donationMethodFormSchema } from '../schemas'

import FormField from '@/components/FormField.vue'
import Input from '@/components/ui/Input.vue'

import type { DonationMethodFormData } from '../types'
import type { DonationMethod } from '@shared/models'
import { QCheckbox } from 'quasar'

const { t } = useI18n()

const props = defineProps<{
  donationMethod?: DonationMethod
}>()

const emit = defineEmits<{
  (e: 'submit', formData: DonationMethodFormData): void
}>()

const { defineField, errors, handleSubmit, resetForm, setErrors } = useForm({
  validationSchema: toTypedSchema(donationMethodFormSchema),
  initialValues: props.donationMethod
    ? {
        name: props.donationMethod?.name,
        isDefault: props.donationMethod?.isDefault,
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
