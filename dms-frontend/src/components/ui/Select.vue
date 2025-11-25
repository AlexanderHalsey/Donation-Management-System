<template>
  <QSelect
    v-bind="qSelectProps"
    :model-value="modelValue"
    :options="selectOptions"
    outlined
    dense
    :error="!!error"
    @update:model-value="updateModelValue"
    @filter="filterFn"
  >
    <template v-for="(_, slot) of $slots" #[slot]="scope">
      <slot :name="slot" v-bind="scope || {}"></slot>
    </template>
    <template #error>
      {{ error }}
    </template>
  </QSelect>
</template>

<script setup lang="ts" generic="T extends SelectOption | SelectOption[] | undefined = undefined">
import { computed, ref } from 'vue'

import { omit } from 'es-toolkit'
import { useTextHelpers } from '@/composables'

import type { QSelectProps } from 'quasar'

const props = defineProps<SelectProps<T>>()

const qSelectProps = computed(() =>
  omit(props, ['modelValue', 'options', 'onUpdate:modelValue', 'error', 'onFilter']),
)

const emit = defineEmits<{
  'update:modelValue': [value: T]
}>()

const textHelpers = useTextHelpers()

const selectOptions = computed<InternalSelectOption[]>(
  () =>
    props.options
      ?.map((option) => ({
        value: option.id,
        label: option.name,
      }))
      ?.filter((option) => textHelpers.isSearchMatch(filter.value, option.label)) || [],
)

const filter = ref('')
const filterFn = (val: string, update: (cb: () => void) => void) => {
  ;(props.lazyLoad?.() ?? Promise.resolve()).then(() => {
    update(() => {
      filter.value = val
    })
  })
}

const modelValue = computed<InternalSelectOption | InternalSelectOption[] | undefined>(() =>
  Array.isArray(props.modelValue)
    ? props.modelValue.map((option) => ({ value: option.id, label: option.name }))
    : props.modelValue
      ? { value: props.modelValue.id, label: props.modelValue.name }
      : undefined,
)

const updateModelValue = (newValue: InternalSelectOption | InternalSelectOption[] | undefined) => {
  emit(
    'update:modelValue',
    (Array.isArray(newValue)
      ? newValue.map((option) => ({
          id: option.value,
          name: option.label,
        }))
      : newValue
        ? { id: newValue.value, name: newValue.label }
        : undefined) as T,
  )
}
</script>

<script lang="ts">
export type SelectOption = {
  id: string
  name: string
}
type InternalSelectOption = {
  value: string
  label: string
}
export type SelectProps<T extends SelectOption | SelectOption[] | undefined = undefined> = {
  modelValue?: T
  options?: SelectOption[]
  error?: string
  lazyLoad?: () => Promise<void>
} & Omit<QSelectProps, 'options' | 'modelValue' | 'onUpdate:modelValue' | 'error' | 'onFilter'>
</script>
