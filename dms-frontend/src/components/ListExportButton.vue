<template>
  <BtnDropdown outline icon="download" color="primary">
    <QList style="width: 254px">
      <QItem clickable v-close-popup @click="$emit('export-csv')">
        <QItemSection avatar>
          <QIcon name="file_download" />
        </QItemSection>
        <QItemSection>
          <QItemLabel>{{ t('labels.downloadCsv') }}</QItemLabel>
        </QItemSection>
      </QItem>
      <QItem clickable v-close-popup @click="$emit('export-xlsx')">
        <QItemSection avatar>
          <QIcon name="file_download" />
        </QItemSection>
        <QItemSection>
          <QItemLabel>{{ t('labels.downloadXlsx') }}</QItemLabel>
        </QItemSection>
      </QItem>
      <QItem>
        <QItemSection>
          <QItemLabel caption>
            {{ t('labels.exportsRespectFilters') }}
          </QItemLabel>
        </QItemSection>
      </QItem>
    </QList>
  </BtnDropdown>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables'

import BtnDropdown from './ui/BtnDropdown.vue'

const { t } = useI18n()

defineEmits<{
  'export-csv': []
  'export-xlsx': []
}>()
</script>

<style scoped></style>
