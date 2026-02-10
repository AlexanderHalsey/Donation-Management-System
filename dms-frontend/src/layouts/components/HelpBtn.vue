<template>
  <Btn flat dense icon="help" color="primary" no-caps>
    {{ t('common.help') }}
    <QMenu :offset="[0, 8]" style="width: 300px">
      <QList>
        <QItem>
          <QItemSection>
            <div class="text-subtitle1 text-weight-bold q-mb-xs">
              <QIcon name="volunteer_activism" class="q-mr-sm" />
              {{ t('nouns.donation', 2) }}
            </div>
            <TitledComponent :title="t('labels.donationsWithTaxReceipt')">
              <div class="list-item-line bg-green-2">
                <span class="text-primary text-bold"
                  >{{ t('labels.lastName').toUpperCase() }} {{ t('labels.firstName') }}</span
                >
                &emsp;...&emsp;...&emsp;...&emsp;...&emsp;...&emsp;...
              </div>
            </TitledComponent>
            <TitledComponent :title="t('labels.donationsEligibleForTaxReceipt')">
              <div class="list-item-line bg-amber-3">
                <span class="text-primary text-bold"
                  >{{ t('labels.lastName').toUpperCase() }} {{ t('labels.firstName') }}</span
                >
                &emsp;...&emsp;...&emsp;...&emsp;...&emsp;...&emsp;...
              </div>
            </TitledComponent>
            <QSeparator class="q-my-sm" />
            <div class="text-subtitle1 text-weight-bold q-mb-xs">
              <QIcon name="person" class="q-mr-sm" />
              {{ t('nouns.donor', 2) }}
            </div>
            <TitledComponent :title="t('labels.disabledDonor')">
              <div class="text-primary text-bold">
                🚫 {{ t('labels.lastName').toUpperCase() }} {{ t('labels.firstName') }}
              </div>
            </TitledComponent>
            <QSeparator class="q-my-sm" />
            <div class="text-subtitle1 text-weight-bold q-mb-xs">
              <QIcon name="receipt_long" class="q-mr-sm" />
              {{ t('nouns.taxReceipt', 2) }}
            </div>
            <TitledComponent :title="t('labels.cancelledTaxReceipt')">
              <div class="list-item-line">
                <span class="text-primary text-bold"
                  >1000&emsp; {{ t('labels.lastName').toUpperCase() }}
                  {{ t('labels.firstName') }}</span
                >
                &emsp;...&emsp;...&emsp;...&emsp;<span>
                  <QIcon name="cancel" color="grey" size="xs" />
                </span>
              </div>
            </TitledComponent>
            <TitledComponent :title="t('labels.failedTaxReceipt')">
              <div class="list-item-line">
                <span class="text-primary text-bold"
                  >1001&emsp; {{ t('labels.lastName').toUpperCase() }}
                  {{ t('labels.firstName') }}</span
                >
                &emsp;...&emsp;...&emsp;...&emsp;<span>
                  <QIcon name="error" color="red" size="xs" />
                </span>
              </div>
            </TitledComponent>
          </QItemSection>
        </QItem>
      </QList>
    </QMenu>
  </Btn>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables'

import TitledComponent from '@/components/TitledComponent.vue'
import Btn from '@/components/ui/Btn.vue'

import { QItemSection } from 'quasar'

const { t } = useI18n()
</script>

<style lang="scss" scoped>
.list-item-line {
  width: 100%;
  height: 25px;
  padding: 1px 8px;
  border-top: 1px solid lightgrey;
  border-bottom: 1px solid lightgrey;
}
</style>
