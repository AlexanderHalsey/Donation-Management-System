<template>
  <QSelect
    v-model="values"
    :options="selectOptions"
    outlined
    dense
    rounded
    multiple
    style="margin-bottom: 20px; width: 230px"
    @update:model-value="updateModelValue"
  >
    <template v-for="(_, slot) of $slots" #[slot]="scope">
      <slot :name="slot" v-bind="scope || {}"></slot>
    </template>
    <template #selected-item="scope">
      <QChip
        removable
        dense
        :tabindex="scope.tabindex"
        color="primary"
        text-color="white"
        class="q-pa-sm"
        @remove="scope.removeAtIndex(scope.index)"
      >
        <span class="ellipsis">{{ scope.opt.label }}</span>
      </QChip>
    </template>
  </QSelect>
</template>

<script setup lang="ts">
import { computed, ref, watch, type PropType } from 'vue'

import type { UuidFilter } from '@shared/models'

export type UuidOption = {
  id: string
  name: string
}

type SelectOption = {
  value: string
  label: string
}

const props = defineProps({
  modelValue: {
    type: Object as PropType<UuidFilter>,
    default: undefined,
  },
  options: {
    type: Array as PropType<Array<UuidOption>>,
    default: () => [],
  },
})

const emit = defineEmits<{
  'update:model-value': [value: UuidFilter]
}>()

const values = ref<SelectOption[]>([])

const selectOptions = computed(() =>
  props.options.map(
    (option): SelectOption => ({
      value: option.id,
      label: option.name,
    }),
  ),
)

const updateModelValue = (newValues: SelectOption[]) => {
  emit('update:model-value', {
    in: newValues.map((option) => option.value),
  })
}

watch(
  () => props.modelValue,
  (newValue) => {
    values.value =
      selectOptions.value.filter((option) => newValue?.in?.includes(option.value)) ?? []
  },
  { immediate: true },
)
</script>
