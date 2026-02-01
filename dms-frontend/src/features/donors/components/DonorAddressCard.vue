<template>
  <QCard>
    <QCardSection>
      <div class="text-h6 q-mb-md flex items-center">
        <QIcon name="location_on" class="q-mr-sm" />
        Adresse
      </div>
      <div v-if="!hasAddressData" class="text-grey-6 text-italic">Aucune adresse renseignée</div>
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

import TitledComponent from '@/components/TitledComponent.vue'

import type { Donor } from '@shared/models'

const props = defineProps({
  donor: {
    type: Object as PropType<Donor>,
    default: undefined,
  },
})

const addressFields = computed<{ key: keyof Donor; label: string }[]>(() => [
  { key: 'streetAddress1', label: 'Adresse ligne 1' },
  { key: 'streetAddress2', label: 'Adresse ligne 2' },
  { key: 'postalCode', label: 'Code postal' },
  { key: 'city', label: 'Ville' },
  { key: 'state', label: 'État/Région' },
  { key: 'country', label: 'Pays' },
])

const hasAddressData = computed(() => {
  return addressFields.value.some((field) => props.donor?.[field.key])
})
</script>

<style scoped></style>
