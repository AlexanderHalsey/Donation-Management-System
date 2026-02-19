<template>
  <Btn outline icon="download" color="primary" @click="$emit('export-csv')" />
  <QTooltip :delay="300" :offset="[0, 5]">
    {{ t('labels.exportsRespectFilters') }}
  </QTooltip>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables'

import Btn from './ui/Btn.vue'

const { t } = useI18n()

defineEmits<{
  'export-csv': []
}>()
</script>

<style scoped></style>
