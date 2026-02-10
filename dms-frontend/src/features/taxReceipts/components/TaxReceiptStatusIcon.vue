<template>
  <div>
    <QIcon
      :name="statusOption.icon"
      :color="statusOption.color"
      size="xs"
      class="flex items-center"
    />
    <QTooltip :delay="100" :offset="[10, 10]">
      {{ statusOption.name }}
    </QTooltip>
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'
import { useI18n } from '@/composables'

import { getTaxReceiptStatusOptions } from '@shared/constants'
import type { TaxReceiptStatus } from '@shared/models'

const { locale } = useI18n()

const props = defineProps({
  taxReceiptStatus: {
    type: String as PropType<TaxReceiptStatus>,
    required: true,
  },
})

const statusOption = computed(
  () =>
    getTaxReceiptStatusOptions(locale.value as 'en' | 'fr').find(
      (option) => option.id === props.taxReceiptStatus,
    )!,
)
</script>
