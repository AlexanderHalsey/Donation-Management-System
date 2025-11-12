<template>
  <Input
    v-bind="$attrs"
    v-model="dateInput"
    dense
    mask="##/##/####"
    placeholder="JJ/MM/AAAA"
    :error="!!error"
    @blur="onBlur"
  >
    <template #append>
      <QIcon name="event" class="cursor-pointer">
        <QPopupProxy ref="qPopupProxy" cover transition-show="scale" transition-hide="scale">
          <QDate
            ref="qDatePicker"
            :model-value="formatDate(props.modelValue)"
            minimal
            mask="DD/MM/YYYY"
            :options="options()"
            @update:model-value="
              (emit('update:modelValue', parseDate($event)), qPopupProxy?.hide())
            "
          />
        </QPopupProxy>
      </QIcon>
    </template>
    <template #error>
      {{ error }}
    </template>
  </Input>
</template>

<script setup lang="ts">
import { ref, watch, type PropType } from 'vue'
import { format, isValid, parse } from 'date-fns'

import Input from './Input.vue'

const props = defineProps({
  modelValue: {
    type: Date,
    default: undefined,
  },
  options: {
    type: Function as PropType<() => (date: string) => boolean>,
    default: () => () => true,
  },
})
const emit = defineEmits<{
  (e: 'update:modelValue', value: Date | undefined): void
}>()

const qPopupProxy = ref<InstanceType<typeof import('quasar').QPopupProxy> | null>(null)
const qDatePicker = ref<InstanceType<typeof import('quasar').QDate> | null>(null)

const dateInput = ref('')
const error = ref<string | undefined>(undefined)

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
    error.value = undefined
    return true
  } else {
    error.value = "La date n'est pas valide"
    return false
  }
}

watch(
  () => props.modelValue,
  (value) => {
    if (dateInput.value !== formatDate(value)) {
      dateInput.value = formatDate(value)
      error.value = undefined
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
    error.value = undefined
  }
})

const onBlur = (event: Event) => {
  if (qDatePicker.value?.$parent?.$el !== (event as FocusEvent).relatedTarget) {
    validate(parseDate(dateInput.value))
  }
}
</script>
