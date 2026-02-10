<template>
  <QDialog v-model="annualReceiptsDialog">
    <QCard>
      <QCardSection class="text-bold" style="font-size: 16px">
        {{ t('actions.confirmAnnualReceiptCreation') }}
      </QCardSection>
      <QCardSection>
        <div class="column items-center">
          <div>
            <div class="text-bold">{{ t('common.summary') }}</div>
            <div class="flex">
              <div class="column">
                <div>{{ t('labels.totalTaxReceiptsToCreate') }}:</div>
                <div>{{ t('labels.totalReceiptsToSendByEmail') }}:</div>
              </div>
              <div class="column q-ml-md">
                <div>
                  <span class="text-bold" data-cy="total-created">{{ totalCreated }}</span>
                </div>
                <div>
                  <span class="text-bold" data-cy="total-sent">{{ totalEmailsSent }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </QCardSection>
      <QCardSection>
        <div class="column items-center">
          {{ t('questions.sureToCreateAnnualTaxReceipts') }}
        </div>
      </QCardSection>
      <QCardActions align="right">
        <Btn flat :label="t('common.cancel')" v-close-popup />
        <Btn
          :label="t('common.confirm')"
          color="primary"
          class="text-white"
          v-close-popup
          @click="$emit('create:annualTaxReceipts')"
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

defineProps({
  totalCreated: {
    type: Number,
    required: true,
  },
  totalEmailsSent: {
    type: Number,
    required: true,
  },
})

defineEmits<{
  'create:annualTaxReceipts': []
}>()

const annualReceiptsDialog = ref<boolean>(false)
const open = () => {
  annualReceiptsDialog.value = true
}

defineExpose({
  open,
})
</script>
