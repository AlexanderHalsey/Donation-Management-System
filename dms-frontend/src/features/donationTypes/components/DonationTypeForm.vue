<template>
  <div class="column">
    <FormField name="name" label="Nom">
      <Input id="name" v-model="name" :error="errors.name" v-bind="nameAttrs" />
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
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, computed } from 'vue'

import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { donationTypeFormSchema } from '../schemas'

import FormField from '@/components/FormField.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'
import { OrganisationTag, getOrganisationRefById } from '@/features/organisations'

import type { DonationTypeFormData } from '../types'
import type { DonationType, OrganisationRef } from '@shared/models'

const props = defineProps<{
  donationType?: DonationType
  organisationOptions: OrganisationRef[]
}>()

const emit = defineEmits<{
  (e: 'submit', formData: DonationTypeFormData): void
}>()

const { defineField, errors, handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(donationTypeFormSchema),
  initialValues: props.donationType
    ? {
        name: props.donationType?.name,
        organisationId: props.donationType?.organisationId,
      }
    : {},
})

const [name, nameAttrs] = defineField('name')
const [organisationId, organisationIdAttrs] = defineField('organisationId')

const organisation = computed(() =>
  props.organisationOptions.find((o) => o.id === organisationId.value),
)

const updateOrganisation = (newOrganisation: OrganisationRef | null) => {
  organisationId.value = newOrganisation?.id
}

const validate = handleSubmit((formData) => {
  emit('submit', formData)
})

defineExpose({ validate })
onBeforeUnmount(() => resetForm())
</script>
