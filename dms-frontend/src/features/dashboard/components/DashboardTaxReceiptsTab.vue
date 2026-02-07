<template>
  <div class="row">
    <div class="q-gutter-md col-4">
      <LoadingCard
        :loading="!statusCounts"
        title="Statut des reçus fiscaux"
        class="q-pa-md"
        data-cy="tax-receipts-status-count"
      >
        <template #title>
          Statut des reçus fiscaux
          <span v-if="!!statusCounts?.FAILED" class="q-ml-xs">⚠️</span>
          <QTooltip
            v-if="!!statusCounts?.FAILED"
            :delay="300"
            :offset="[10, 10]"
            color
            class="bg-warning text-subtitle2"
            max-width="400px"
          >
            Certains reçus fiscaux n'ont pas pu être générés. Veuillez vous rendre sur la page des
            reçus fiscaux pour tenter de les regénérer.
          </QTooltip>
        </template>
        <div class="q-gutter-md q-mt-sm">
          <div
            v-for="statusOption in TAX_RECEIPT_STATUS_OPTIONS"
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

import LoadingCard from '@/components/LoadingCard.vue'

import { TaxReceiptStatusIcon } from '@/features/taxReceipts'

import { TAX_RECEIPT_STATUS_OPTIONS } from '@shared/constants'

import type { TaxReceiptStatus } from '@shared/models'

defineProps({
  statusCounts: {
    type: Object as PropType<Record<TaxReceiptStatus, number>>,
    default: undefined,
  },
})
</script>
