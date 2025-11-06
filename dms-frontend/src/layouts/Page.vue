<template>
  <QPage padding>
    <QPageSticky expand position="top" class="page">
      <QToolbar style="padding: 24px 24px">
        <QToolbarTitle>
          {{ title }}
        </QToolbarTitle>
        <slot name="actions"></slot>
      </QToolbar>
    </QPageSticky>

    <div style="margin-top: 80px">
      <slot />
    </div>
  </QPage>
</template>

<script setup lang="ts">
import { inject, type PropType } from 'vue'

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
})

const setBreadcrumbs = inject(setBreadcrumbsInjectionKey)
if (setBreadcrumbs) {
  setBreadcrumbs(props.breadcrumbs)
}
</script>

<style lang="scss" scoped>
.page {
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(9px);
}
</style>
