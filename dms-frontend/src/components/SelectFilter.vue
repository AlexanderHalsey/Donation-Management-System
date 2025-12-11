<template>
  <Select
    v-model="values"
    :options="options"
    rounded
    multiple
    use-input
    :lazy-load="lazyLoad"
    :input-debounce="0"
    style="width: 230px"
    @update:model-value="updateModelValue"
  >
    <template v-for="(_, slot) of $slots" #[slot]="scope">
      <slot :name="slot" v-bind="scope || {}"></slot>
    </template>
    <template #no-option>
      <QItem>
        <QItemSection class="text-grey"> Aucune option trouvée </QItemSection>
      </QItem>
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
  </Select>
</template>

<script setup lang="ts" generic="T extends SelectFilter">
import { ref, watch } from 'vue'

import Select, { type SelectOption } from './ui/Select.vue'

import type { SelectFilter } from '@shared/models'

const props = defineProps<{
  modelValue?: T
  options: Array<SelectOption>
  lazyLoad?: () => Promise<void>
}>()

const emit = defineEmits<{
  'update:model-value': [value: T]
  'lazy-load': []
}>()

const values = ref<SelectOption[]>([])
const updateModelValue = (newValues: SelectOption[]) => {
  emit('update:model-value', {
    in: newValues.map((option) => option.id),
  } as T)
}

watch(
  () => props.modelValue,
  (newValue) => {
    values.value = props.options.filter((option) => newValue?.in?.includes(option.id)) ?? []
  },
  { immediate: true },
)
</script>
