<template>
  <div class="flex q-gutter-md">
    <Input
      v-for="[key, label] of ([
        ['gte', 'de'],
        ['lte', 'à'],
      ] as const)"
      :key="key"
      :label="label"
      :model-value="modelValue?.[key]"
      type="number"
      rounded
      dense
      :error="!!errors?.[key]"
      style="width: 200px"
      @update:model-value="updateModelValue($event as number | undefined, key)"
    >
      <template #append><span class="text-body1 text-bold">€</span></template>
      <template #error>{{ errors?.[key] }}</template>
    </Input>
  </div>
</template>

<script setup lang="ts">
import { ref, type PropType } from 'vue'
import Input from './ui/Input.vue'

import type { FloatFilter } from '@shared/models'

const props = defineProps({
  modelValue: {
    type: Object as PropType<FloatFilter>,
    default: undefined,
  },
})

const emit = defineEmits<{
  'update:modelValue': [value: FloatFilter | undefined]
}>()

const errors = ref<{ [key in keyof FloatFilter]?: string }>({})

const validateRange = (newValue: number | undefined, key: keyof FloatFilter) => {
  if (newValue === undefined) return null

  const currentFilter = props.modelValue
  const gteValue = key === 'gte' ? newValue : currentFilter?.gte
  const lteValue = key === 'lte' ? newValue : currentFilter?.lte

  if (gteValue !== undefined && lteValue !== undefined && gteValue > lteValue) {
    return {
      gte: 'Supérieur à « à »',
      lte: 'Inférieur à « de »',
    }
  }

  return null
}

const updateModelValue = (value: number | undefined, key: keyof FloatFilter) => {
  const validationError = validateRange(value, key)

  if (validationError) {
    errors.value = validationError
    return
  } else {
    errors.value = { gte: undefined, lte: undefined }
  }

  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value,
  })
}
</script>
