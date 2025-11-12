<template>
  <QBtn v-bind="props" no-caps style="border-radius: 8px">
    <template v-for="(_, slot) of $slots" #[slot]="scope">
      <slot :name="slot" v-bind="scope || {}"></slot>
    </template>
  </QBtn>
</template>

<script setup lang="ts">
import type { QBtnProps } from 'quasar'

const props = defineProps<QBtnProps>()
</script>

<style lang="scss" scoped>
:deep() {
  .q-btn__content {
    gap: 0.5em;
  }
}
</style>
