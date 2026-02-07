<template>
  <QCard>
    <div v-if="!loading && (title || $slots.title)" class="text-h6">
      <template v-if="!$slots.title">{{ title }}</template>
      <slot name="title" v-else />
    </div>
    <QSkeleton v-if="loading" height="100%" :style="{ height: loadingHeight }" />
    <slot v-else />
  </QCard>
</template>

<script setup lang="ts">
import { QCard } from 'quasar'

defineProps({
  loading: {
    type: Boolean,
    required: true,
  },
  loadingHeight: {
    type: String,
    default: '150px',
  },
  title: {
    type: String,
    default: undefined,
  },
})
</script>
