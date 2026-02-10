<template>
  <QDialog v-model="deleteDialog">
    <QCard>
      <QCardSection class="text-bold" style="font-size: 16px">
        {{ t('actions.confirmDeletion') }}
      </QCardSection>
      <QCardSection>
        {{ t('questions.sureToDeleteDonation') }}
      </QCardSection>
      <QCardActions align="right">
        <Btn flat :label="t('common.cancel')" v-close-popup />
        <Btn
          flat
          :label="t('common.confirm')"
          color="red"
          class="text-white"
          v-close-popup
          @click="$emit('delete:donation')"
        />
      </QCardActions>
    </QCard>
  </QDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@/composables'

import Btn from '@/components/ui/Btn.vue'

const { t } = useI18n()

defineEmits<{
  'delete:donation': []
}>()

const deleteDialog = ref<boolean>(false)
const open = () => {
  deleteDialog.value = true
}

defineExpose({
  open,
})
</script>
