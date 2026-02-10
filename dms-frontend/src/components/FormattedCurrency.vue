<template>
  {{ formattedCurrency }}
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/composables'

const props = defineProps({
  value: {
    type: Number,
    required: true,
  },
})

const { locale } = useI18n()

const formattedCurrency = computed(() =>
  props.value.toLocaleString(locale.value === 'fr' ? 'fr-FR' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
  }),
)
</script>
