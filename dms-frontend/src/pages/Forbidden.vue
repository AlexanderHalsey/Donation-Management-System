<template>
  <div>403 - {{ t('pages.forbidden') }}</div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables'

const { t } = useI18n()
</script>
