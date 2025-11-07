<template>
  <span>{{ formattedValue }}</span>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

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
    locale: fr,
  })
})
</script>
