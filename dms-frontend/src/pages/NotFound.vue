<template>
  <div>404 - {{ t('pages.notFound') }}</div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables'

const { t } = useI18n()
</script>
