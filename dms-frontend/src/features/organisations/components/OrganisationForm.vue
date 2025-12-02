<template>
  <div class="column q-gutter-md">
    <FormField name="name" label="Nom interne">
      <Input id="name" v-model="name" :error="errors.name" v-bind="nameAttrs" />
    </FormField>

    <FormField name="title" label="Nom sur le reçu">
      <Input id="title" v-model="title" :error="errors.title" v-bind="titleAttrs" />
    </FormField>

    <FormField name="address" label="Adresse">
      <Input id="address" v-model="address" :error="errors.address" v-bind="addressAttrs" />
    </FormField>

    <FormField name="locality" label="Ville">
      <Input id="locality" v-model="locality" :error="errors.locality" v-bind="localityAttrs" />
    </FormField>

    <FormField name="postCode" label="Code postal">
      <Input id="postCode" v-model="postCode" :error="errors.postCode" v-bind="postCodeAttrs" />
    </FormField>

    <FormField name="logoUrl" label="Logo">
      <!-- TODO : implement file input -->
      Logo upload to be implemented
      <!-- <Input id="logoUrl" v-model="logoUrl" :error="errors.logoUrl" v-bind="logoUrlAttrs" /> -->
    </FormField>

    <FormField name="object" label="Objet">
      <Input id="object" v-model="object" :error="errors.object" v-bind="objectAttrs" />
    </FormField>

    <FormField name="objectDescription" label="Description de l'objet">
      <Input
        id="objectDescription"
        v-model="objectDescription"
        :error="errors.objectDescription"
        v-bind="objectDescriptionAttrs"
        type="textarea"
        rows="5"
      />
    </FormField>

    <FormField name="signatoryName" label="Nom du signataire">
      <Input
        id="signatoryName"
        v-model="signatoryName"
        :error="errors.signatoryName"
        v-bind="signatoryNameAttrs"
      />
    </FormField>

    <FormField name="signatoryPosition" label="Fonction du signataire">
      <Input
        id="signatoryPosition"
        v-model="signatoryPosition"
        :error="errors.signatoryPosition"
        v-bind="signatoryPositionAttrs"
      />
    </FormField>

    <FormField name="signatureUrl" label="Signature">
      <!-- TODO : implement file input -->
      Signature upload to be implemented
      <!-- <Input
        id="signatureUrl"
        v-model="signatureUrl"
        :error="errors.signatureUrl"
        v-bind="signatureUrlAttrs"
      /> -->
    </FormField>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount } from 'vue'

import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { organisationFormSchema } from '../schemas'

import FormField from '@/components/FormField.vue'
import Input from '@/components/ui/Input.vue'

import type { OrganisationFormData } from '../types'
import type { Organisation } from '@shared/models'

const props = defineProps<{
  organisation?: Organisation
}>()

const emit = defineEmits<{
  (e: 'submit', formData: OrganisationFormData): void
}>()

const { defineField, errors, handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(organisationFormSchema),
  initialValues: props.organisation ?? {},
})

const [name, nameAttrs] = defineField('name')
const [title, titleAttrs] = defineField('title')
const [address, addressAttrs] = defineField('address')
const [locality, localityAttrs] = defineField('locality')
const [postCode, postCodeAttrs] = defineField('postCode')
// const [logoUrl, logoUrlAttrs] = defineField('logoUrl')
const [object, objectAttrs] = defineField('object')
const [objectDescription, objectDescriptionAttrs] = defineField('objectDescription')
const [signatoryName, signatoryNameAttrs] = defineField('signatoryName')
const [signatoryPosition, signatoryPositionAttrs] = defineField('signatoryPosition')
// const [signatureUrl, signatureUrlAttrs] = defineField('signatureUrl')

const validate = handleSubmit((formData) => {
  emit('submit', formData)
})

defineExpose({ validate })
onBeforeUnmount(() => resetForm())
</script>
