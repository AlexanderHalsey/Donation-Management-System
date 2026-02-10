<template>
  <div class="row">
    <div class="q-gutter-md col-4">
      <LoadingCard :loading="!statusCounts" class="q-pa-md" data-cy="tax-receipts-status-count">
        <template #title>
          {{ t('labels.taxReceiptsStatus') }}
          <span v-if="!!statusCounts?.FAILED" class="q-ml-xs">⚠️</span>
          <QTooltip
            v-if="!!statusCounts?.FAILED"
            :delay="300"
            :offset="[10, 10]"
            class="bg-warning text-subtitle2"
            max-width="400px"
          >
            {{ t('labels.taxReceiptsFailedTooltip') }}
          </QTooltip>
        </template>
        <div class="q-gutter-md q-mt-sm">
          <div
            v-for="statusOption in taxReceiptStatusOptions"
            :key="statusOption.id"
            data-cy="tax-receipt-status-option"
          >
            <div class="text-bold text-center">{{ statusOption.name }}</div>
            <div class="flex justify-center items-center">
              <TaxReceiptStatusIcon :tax-receipt-status="statusOption.id" class="q-mr-sm q-mt" />
              <div>{{ statusCounts?.[statusOption.id] ?? 0 }}</div>
            </div>
          </div>
        </div>
      </LoadingCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { useI18n } from '@/composables'

import LoadingCard from '@/components/LoadingCard.vue'

import { TaxReceiptStatusIcon } from '@/features/taxReceipts'

import { getTaxReceiptStatusOptions } from '@shared/constants'

import type { TaxReceiptStatus } from '@shared/models'

const { locale, t } = useI18n()

defineProps({
  statusCounts: {
    type: Object as PropType<Record<TaxReceiptStatus, number>>,
    default: undefined,
  },
})

const taxReceiptStatusOptions = getTaxReceiptStatusOptions(locale.value as 'en' | 'fr')
</script>
