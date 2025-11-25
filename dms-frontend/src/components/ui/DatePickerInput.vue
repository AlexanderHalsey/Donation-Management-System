<template>
  <Input
    v-model="dateInput"
    dense
    mask="##/##/####"
    placeholder="JJ/MM/AAAA"
    :error="internalError"
    :rounded="rounded"
    @blur="internalOnBlur"
  >
    <template #append>
      <QIcon name="event" class="cursor-pointer">
        <QPopupProxy ref="qPopupProxy" cover transition-show="scale" transition-hide="scale">
          <QDate
            ref="qDatePicker"
            :model-value="formatDate(modelValue)"
            minimal
            mask="DD/MM/YYYY"
            :options="options?.()"
            @update:model-value="
              (emit('update:modelValue', parseDate($event)), qPopupProxy?.hide())
            "
          />
        </QPopupProxy>
      </QIcon>
    </template>
  </Input>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { format, isValid, parse } from 'date-fns'

import Input from './Input.vue'

const props = defineProps<DatePickerInputProps>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: Date | undefined): void
}>()

const qPopupProxy = ref<InstanceType<typeof import('quasar').QPopupProxy> | null>(null)
const qDatePicker = ref<InstanceType<typeof import('quasar').QDate> | null>(null)

const dateInput = ref('')
const internalError = ref<string | undefined>(props.error)

const formatDate = (date?: Date): string => {
  return date ? format(date, 'dd/MM/yyyy') : ''
}

const parseDate = (dateString: string): Date | undefined => {
  if (dateString.length === 0) return undefined
  // force date string to have 4 digits for year or return invalid date
  if (!/\d{2}\/\d{2}\/\d{4}/g.test(dateString)) return new Date('invalid')
  return parse(dateString, 'dd/MM/yyyy', new Date())
}

const validate = (date?: Date): boolean => {
  if (!date) return false
  if (isValid(date)) {
    internalError.value = undefined
    return true
  } else {
    internalError.value = "La date n'est pas valide"
    return false
  }
}

watch(
  () => props.modelValue,
  (value) => {
    if (dateInput.value !== formatDate(value)) {
      dateInput.value = formatDate(value)
      internalError.value = undefined
    }
  },
  { immediate: true },
)

watch(dateInput, (value) => {
  if (dateInput.value !== formatDate(props.modelValue)) {
    if (value.length === 10) {
      const newDate = parseDate(value)
      if (validate(newDate)) {
        emit('update:modelValue', newDate)
      }
    } else if (value.length === 0) {
      emit('update:modelValue', undefined)
    }
  } else {
    internalError.value = undefined
  }
})

watch(
  () => props.error,
  (newError) => {
    internalError.value = newError
  },
)

const internalOnBlur = (event: Event) => {
  if (qDatePicker.value?.$parent?.$el !== (event as FocusEvent).relatedTarget) {
    validate(parseDate(dateInput.value))
  }
  props?.onBlur?.(event)
}
</script>

<script lang="ts">
import type { QInputProps } from 'quasar'
export type DatePickerInputProps = {
  modelValue?: Date
  options?: () => (date: string) => boolean
  error?: string
} & Omit<QInputProps, 'modelValue' | 'onUpdate:modelValue' | 'options' | 'error'>

export const dateOptions = (options?: { minDate?: Date; maxDate?: Date }) => {
  return (datelike: string): boolean => {
    const date = parse(datelike, 'yyyy/MM/dd', new Date())
    if (isNaN(date.getTime())) return false
    if (!!options?.minDate && date < options.minDate) return false
    if (!!options?.maxDate && date > options.maxDate) return false
    return true
  }
}
</script>
