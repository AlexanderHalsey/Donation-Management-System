<template>
  <QOptionGroup
    :model-value="computedModelValue"
    :options="options"
    type="checkbox"
    class="row"
    style="padding-bottom: 20px"
    @update:model-value="updateModelValue"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/composables'

import { difference } from 'es-toolkit'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: undefined,
  },
})

type Option = {
  label: string
  value: boolean
}
const options = computed<Option[]>(() => [
  { label: t('common.no'), value: false },
  { label: t('common.yes'), value: true },
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
    padding: 8px 23px;
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
