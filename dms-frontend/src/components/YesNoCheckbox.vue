<template>
  <QOptionGroup
    :model-value="computedModelValue"
    :options="options"
    type="checkbox"
    class="row"
    @update:model-value="updateModelValue"
  />
</template>

<script setup lang="ts">
import { difference } from 'es-toolkit'
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: undefined,
  },
})

type Option = {
  label: 'Oui' | 'Non'
  value: boolean
}
const options = computed<Option[]>(() => [
  { label: 'Non', value: false },
  { label: 'Oui', value: true },
])

const emit = defineEmits<{
  'update:model-value': [modelValue: boolean | undefined]
}>()

const computedModelValue = computed<boolean[]>(() => {
  return options.value
    .filter((option) => props.modelValue === option.value)
    .map((option) => option.value)
})

const updateModelValue = (newValue: boolean[]) => {
  emit('update:model-value', difference(newValue, computedModelValue.value)[0])
}
</script>

<style lang="scss" scoped>
:deep() {
  .q-checkbox {
    border-radius: 50px;
    padding: 9px 23px;
    border: 1px solid $grey-5;
    &[aria-checked='true'] {
      outline: 1px solid $primary !important;
      border-color: $primary;
      color: $primary;
      font-weight: bold;
    }
    .q-checkbox__inner {
      display: none;
    }
    &:hover {
      border-color: $grey-10;
    }
  }
}
</style>
