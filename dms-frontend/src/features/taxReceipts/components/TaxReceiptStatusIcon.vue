<template>
  <div>
    <QIcon :name="statusOption.icon" :color="statusOption.color" size="xs" />
    <QTooltip :delay="100" :offset="[10, 10]">
      {{ statusOption.name }}
    </QTooltip>
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'

import { TAX_RECEIPT_STATUS_OPTIONS } from '@shared/constants'
import type { TaxReceiptStatus } from '@shared/models'

const props = defineProps({
  taxReceiptStatus: {
    type: String as PropType<TaxReceiptStatus>,
    required: true,
  },
})

const statusOption = computed(
  () => TAX_RECEIPT_STATUS_OPTIONS.find((option) => option.id === props.taxReceiptStatus)!,
)
</script>
