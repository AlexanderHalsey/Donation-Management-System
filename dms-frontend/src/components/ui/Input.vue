<template>
  <QInput v-bind="omit(props, ['onUpdate:modelValue'])" outlined @update:model-value="onInput">
    <template v-for="(_, slot) of $slots" #[slot]="scope">
      <slot :name="slot" v-bind="scope || {}"></slot>
    </template>
  </QInput>
</template>

<script setup lang="ts">
import { omit } from 'es-toolkit'
import type { QInputProps } from 'quasar'

const props = defineProps<QInputProps>()
const emit = defineEmits<{
  (e: 'update:model-value', value: string | number | null | undefined): void
}>()

const onInput = (value?: string | number | null): void => {
  const newValue =
    props.type === 'number' ? ((value ? Number(value) : undefined) as unknown as string) : value
  if (newValue !== props.modelValue) {
    emit('update:model-value', newValue)
  }
}
</script>
