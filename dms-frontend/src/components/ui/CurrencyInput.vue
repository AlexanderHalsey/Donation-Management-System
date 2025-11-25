<template>
  <QInput
    ref="inputRef"
    v-model="formattedValue"
    dense
    outlined
    :error="!!props.error"
    :error-message="props.error"
  >
    <template v-for="(_, slot) of $slots" #[slot]="scope">
      <slot :name="slot" v-bind="scope || {}"></slot>
    </template>
  </QInput>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useCurrencyInput } from 'vue-currency-input'
import type { QInputProps } from 'quasar'

const props = defineProps<
  Omit<QInputProps, 'error' | 'modelValue' | 'onUpdate:modelValue'> & {
    error?: string
    modelValue?: number
  }
>()
defineEmits<{
  (e: 'update:modelValue', value?: number): void
  (e: 'change', value?: number): void
}>()

const { formattedValue, inputRef, setValue } = useCurrencyInput({
  locale: 'fr-FR',
  currency: 'EUR',
})

watch(
  () => props.modelValue,
  (newValue) => {
    setValue(newValue ?? null)
  },
)
</script>
