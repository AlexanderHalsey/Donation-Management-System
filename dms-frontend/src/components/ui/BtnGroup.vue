<template>
  <QBtnGroup v-bind="props" no-caps>
    <div class="q-btn-group-wrapper">
      <slot />
    </div>
  </QBtnGroup>
</template>

<script setup lang="ts">
import type { QBtnGroupProps } from 'quasar'

const props = defineProps<QBtnGroupProps>()
</script>

<style lang="scss" scoped>
.q-btn-group-wrapper > * {
  &:not(:first-child) {
    border-top-left-radius: 0 !important;
    border-bottom-left-radius: 0 !important;
  }
  &:not(:last-child) {
    border-top-right-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
  }
}
</style>
