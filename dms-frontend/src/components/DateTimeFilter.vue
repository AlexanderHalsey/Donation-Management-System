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
      style="width: 230px"
      :options="
        () =>
          dateOptions(
            key === 'gte' ? { maxDate: props.modelValue?.lte } : { minDate: props.modelValue?.gte },
          )
      "
      @update:model-value="(date) => updateModelValue(date, key)"
    />
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

import { endOfDay, startOfDay } from 'date-fns'
import DatePickerInput, { dateOptions } from './ui/DatePickerInput.vue'

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
