<template>
  <BtnDropdown outline icon="download" color="primary">
    <QList style="width: 254px">
      <QItem clickable v-close-popup @click="$emit('export-csv')">
        <QItemSection avatar>
          <QIcon name="file_download" />
        </QItemSection>
        <QItemSection>
          <QItemLabel>Télécharger Csv</QItemLabel>
        </QItemSection>
      </QItem>
      <QItem clickable v-close-popup @click="$emit('export-xlsx')">
        <QItemSection avatar>
          <QIcon name="file_download" />
        </QItemSection>
        <QItemSection>
          <QItemLabel>Télécharger Xlsx</QItemLabel>
        </QItemSection>
      </QItem>
      <QItem>
        <QItemSection>
          <QItemLabel caption>
            Les exports respectent les filtres appliqués sur la liste.
          </QItemLabel>
        </QItemSection>
      </QItem>
    </QList>
  </BtnDropdown>
</template>

<script setup lang="ts">
import BtnDropdown from './ui/BtnDropdown.vue'

defineEmits<{
  'export-csv': []
  'export-xlsx': []
}>()
</script>

<style scoped></style>
