<template>
  <div class="column">
    <FormField name="name" label="Nom">
      <Input id="name" v-model="name" :error="errors.name" v-bind="nameAttrs" />
    </FormField>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount } from 'vue'

import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { paymentModeFormSchema } from '../schemas'

import FormField from '@/components/FormField.vue'
import Input from '@/components/ui/Input.vue'

import type { PaymentModeFormData } from '../types'
import type { PaymentMode } from '@shared/models'

const props = defineProps<{
  paymentMode?: PaymentMode
}>()

const emit = defineEmits<{
  (e: 'submit', formData: PaymentModeFormData): void
}>()

const { defineField, errors, handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(paymentModeFormSchema),
  initialValues: props.paymentMode
    ? {
        name: props.paymentMode?.name,
      }
    : {},
})

const [name, nameAttrs] = defineField('name')

const validate = handleSubmit((formData) => {
  emit('submit', formData)
})

defineExpose({ validate })
onBeforeUnmount(() => resetForm())
</script>
