<template>
  <QCard>
    <QCardSection>
      <div class="text-h6 q-mb-md flex items-center">
        <QIcon name="location_on" class="q-mr-sm" />
        {{ t('labels.address') }}
      </div>
      <div v-if="!hasAddressData" class="text-grey-6 text-italic">
        {{ t('placeholders.noAddressProvided') }}
      </div>
      <div v-else class="row q-gutter-xl">
        <TitledComponent
          v-for="field in addressFields"
          :key="field.key"
          :title="field.label"
          class="col-auto"
        >
          {{ donor?.[field.key] || '&nbsp;-' }}
        </TitledComponent>
      </div>
    </QCardSection>
  </QCard>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'
import { useI18n } from '@/composables'

import TitledComponent from '@/components/TitledComponent.vue'

import type { Donor } from '@shared/models'

const { t } = useI18n()

const props = defineProps({
  donor: {
    type: Object as PropType<Donor>,
    default: undefined,
  },
})

const addressFields = computed<{ key: keyof Donor; label: string }[]>(() => [
  { key: 'streetAddress1', label: t('labels.streetAddress1') },
  { key: 'streetAddress2', label: t('labels.streetAddress2') },
  { key: 'postalCode', label: t('labels.postalCode') },
  { key: 'city', label: t('labels.city') },
  { key: 'state', label: t('labels.state') },
  { key: 'country', label: t('labels.country') },
])

const hasAddressData = computed(() => {
  return addressFields.value.some((field) => props.donor?.[field.key])
})
</script>

<style scoped></style>
