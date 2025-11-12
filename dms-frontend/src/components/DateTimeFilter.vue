<template>
  <div class="flex q-gutter-md">
    <DatePickerInput
      v-for="[key, label] of ([
        ['gte', 'de'],
        ['lte', 'à'],
      ] as const)"
      :key="key"
      :model-value="props.modelValue?.[key]"
      :label="label"
      rounded
      :options="() => (date) => optionsFn(date, key)"
      @update:model-value="(date) => updateModelValue(date, key)"
    />
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

import { endOfDay, parse, startOfDay } from 'date-fns'
import DatePickerInput from './ui/DatePickerInput.vue'

import type { DateTimeFilter } from '@shared/models'

const props = defineProps({
  modelValue: {
    type: Object as PropType<DateTimeFilter>,
    default: undefined,
  },
})

const emit = defineEmits<{
  'update:modelValue': [value: DateTimeFilter | undefined]
}>()

const optionsFn = (v: string, key: keyof DateTimeFilter): boolean => {
  const date = parse(v, 'yyyy/MM/dd', new Date())
  if (isNaN(date.getTime())) return false
  if (key === 'gte' && !!props.modelValue?.lte) {
    if (date > props.modelValue.lte) return false
  }
  if (key === 'lte' && !!props.modelValue?.gte) {
    if (date < props.modelValue.gte) return false
  }
  return true
}

const updateModelValue = (date: Date | undefined, key: keyof DateTimeFilter) => {
  if (date) {
    if (key === 'gte') date = startOfDay(date)
    if (key === 'lte') date = endOfDay(date)
  }
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: date,
  })
}
</script>
