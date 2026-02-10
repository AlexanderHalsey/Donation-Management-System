<template>
  <div class="column q-gutter-md">
    <FormField name="name" :label="t('nouns.internalName')" required>
      <Input id="name" v-model="name" :error="errors.name" v-bind="nameAttrs" />
    </FormField>

    <FormField name="isTaxReceiptEnabled" :label="t('labels.eligibleForTaxReceipts')">
      <QCheckbox
        id="isTaxReceiptEnabled"
        v-model="isTaxReceiptEnabled"
        :error="errors.isTaxReceiptEnabled"
        v-bind="isTaxReceiptEnabledAttrs"
        style="padding-bottom: 20px"
      />
    </FormField>

    <FormField name="title" :label="t('nouns.taxReceiptName')">
      <Input id="title" v-model="title" :error="errors.title" v-bind="titleAttrs" />
    </FormField>

    <FormField name="streetAddress" :label="t('labels.address')">
      <Input
        id="streetAddress"
        v-model="streetAddress"
        :error="errors.streetAddress"
        v-bind="streetAddressAttrs"
      />
    </FormField>

    <FormField name="city" :label="t('labels.city')">
      <Input id="city" v-model="city" :error="errors.city" v-bind="cityAttrs" />
    </FormField>

    <FormField name="postalCode" :label="t('labels.postalCode')">
      <Input
        id="postalCode"
        v-model="postalCode"
        :error="errors.postalCode"
        v-bind="postalCodeAttrs"
      />
    </FormField>

    <FormField name="logoId" :label="t('nouns.logo')">
      <FileInput
        id="logoId"
        v-model="logo"
        :error="errors.logoId"
        fileType="image"
        v-bind="logoIdAttrs"
      />
    </FormField>

    <FormField name="object" :label="t('nouns.object')">
      <Input id="object" v-model="object" :error="errors.object" v-bind="objectAttrs" />
    </FormField>

    <FormField name="objectDescription" :label="t('nouns.objectDescription')">
      <Input
        id="objectDescription"
        v-model="objectDescription"
        :error="errors.objectDescription"
        v-bind="objectDescriptionAttrs"
        type="textarea"
        rows="5"
      />
    </FormField>

    <FormField name="signatoryName" :label="t('nouns.signatoryName')">
      <Input
        id="signatoryName"
        v-model="signatoryName"
        :error="errors.signatoryName"
        v-bind="signatoryNameAttrs"
      />
    </FormField>

    <FormField name="signatoryPosition" :label="t('nouns.signatoryPosition')">
      <Input
        id="signatoryPosition"
        v-model="signatoryPosition"
        :error="errors.signatoryPosition"
        v-bind="signatoryPositionAttrs"
      />
    </FormField>

    <FormField name="signatureId" :label="t('nouns.signature')">
      <FileInput
        id="signatureId"
        v-model="signature"
        :error="errors.signatureId"
        fileType="image"
        v-bind="signatureIdAttrs"
      />
    </FormField>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from '@/composables'

import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { organisationFormSchema } from '../schemas'

import FileInput from '@/components/ui/FileInput.vue'
import FormField from '@/components/FormField.vue'
import Input from '@/components/ui/Input.vue'

import type { OrganisationFormData } from '../types'
import type { Organisation } from '@shared/models'

const { t } = useI18n()

const props = defineProps<{
  organisation?: Organisation
}>()

const emit = defineEmits<{
  (e: 'submit', formData: OrganisationFormData): void
}>()

const { defineField, errors, handleSubmit, resetForm, setErrors } = useForm({
  validationSchema: toTypedSchema(organisationFormSchema),
  initialValues: props.organisation
    ? {
        ...props.organisation,
        logoId: props.organisation.logo?.id,
        signatureId: props.organisation.signature?.id,
      }
    : { isTaxReceiptEnabled: false },
})

const [name, nameAttrs] = defineField('name')
const [isTaxReceiptEnabled, isTaxReceiptEnabledAttrs] = defineField('isTaxReceiptEnabled')
const [title, titleAttrs] = defineField('title')
const [streetAddress, streetAddressAttrs] = defineField('streetAddress')
const [city, cityAttrs] = defineField('city')
const [postalCode, postalCodeAttrs] = defineField('postalCode')

const [logoId, logoIdAttrs] = defineField('logoId')
const logo = ref<{ id: string; name: string } | undefined>(props.organisation?.logo)
watch(logo, (newLogo) => {
  logoId.value = newLogo?.id
})

const [object, objectAttrs] = defineField('object')
const [objectDescription, objectDescriptionAttrs] = defineField('objectDescription')
const [signatoryName, signatoryNameAttrs] = defineField('signatoryName')
const [signatoryPosition, signatoryPositionAttrs] = defineField('signatoryPosition')

const [signatureId, signatureIdAttrs] = defineField('signatureId')
const signature = ref<{ id: string; name: string } | undefined>(props.organisation?.signature)
watch(signature, (newSignature) => {
  signatureId.value = newSignature?.id
})

const validate = handleSubmit((formData) => {
  emit('submit', formData)
})

defineExpose({ setErrors, validate })
onBeforeUnmount(() => resetForm())
</script>
