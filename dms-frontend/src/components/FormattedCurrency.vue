<template>
  {{ formattedCurrency }}
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'

const props = defineProps({
  value: {
    type: Number,
    required: true,
  },
  currencyType: {
    type: String as PropType<'EUR' | 'USD' | 'GBP'>,
    default: 'EUR',
  },
  locale: {
    type: String as PropType<'fr-FR' | 'en-US' | 'en-GB'>,
    default: 'fr-FR',
  },
})

const formattedCurrency = computed(() =>
  props.value.toLocaleString(props.locale, {
    style: 'currency',
    currency: props.currencyType,
  }),
)
</script>
