<template>
  <span>{{ formattedValue }}</span>
</template>

<script setup lang="ts">
import { computed, onMounted, type PropType, ref } from 'vue'
import { useI18n } from '@/composables'

import { format, type Locale } from 'date-fns'

const { locale: i18nLocale } = useI18n()

const props = defineProps({
  value: {
    type: Date as PropType<Date>,
    required: true,
  },
  pattern: {
    type: String as PropType<'date' | 'date-time' | 'time'>,
    default: 'date',
    validator: (val: string) => ['date', 'date-time', 'time'].includes(val),
  },
})

const locale = ref<Locale>()

const formattedValue = computed(() => {
  let formatPattern: string
  switch (props.pattern) {
    case 'date':
      formatPattern = 'P'
      break
    case 'date-time':
      formatPattern = 'P p'
      break
    case 'time':
      formatPattern = 'p'
      break
  }
  return format(props.value, formatPattern!, {
    locale: locale.value,
  })
})

onMounted(async () => {
  locale.value =
    i18nLocale.value === 'fr'
      ? (await import('date-fns/locale/fr')).fr
      : (await import('date-fns/locale/en-GB')).enGB
})
</script>
