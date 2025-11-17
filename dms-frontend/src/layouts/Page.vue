<template>
  <QPage style="padding: 20px 20px">
    <QPageSticky expand position="top" class="page">
      <QToolbar style="padding: 20px 20px">
        <QToolbarTitle>
          {{ title }}
        </QToolbarTitle>
        <slot name="actions"></slot>
      </QToolbar>
    </QPageSticky>

    <div v-if="!loading" style="margin-top: 65px">
      <slot />
    </div>
    <div
      v-else
      class="row items-center justify-center"
      style="width: 100%; height: calc(100vh - 150px)"
    >
      <QSpinnerPie color="primary" size="70" />
    </div>
  </QPage>
</template>

<script setup lang="ts">
import { inject, watch, type PropType } from 'vue'

import { setBreadcrumbsInjectionKey } from '@/symbols'
import type { Breadcrumb } from '@/types'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  breadcrumbs: {
    type: Array as PropType<Breadcrumb[]>,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const setBreadcrumbs = inject(setBreadcrumbsInjectionKey)
watch(
  () => props.breadcrumbs,
  (newBreadcrumbs) => {
    if (setBreadcrumbs) {
      setBreadcrumbs(newBreadcrumbs)
    }
  },
  { immediate: true },
)
</script>

<style lang="scss" scoped>
.page {
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(9px);
  z-index: 1;
}

.q-toolbar__title {
  font-weight: 600;
  font-size: 22px;
}
</style>
