<template>
  <Btn
    v-show="showActions"
    v-bind="$attrs"
    icon="more_vert"
    flat
    round
    dense
    @click="clickShowAction"
  />
  <QMenu v-model="showAction" style="min-width: 125px; border-radius: 6px">
    <QList dense class="q-pa-xs">
      <QItem
        v-if="canRetry"
        clickable
        v-close-popup
        class="text-orange"
        style="padding: 8px 12px; border-radius: 6px"
        @click="$emit('retry-failed:taxReceipt', taxReceipt)"
      >
        <QItemSection style="flex: unset">
          <QIcon name="autorenew" />
        </QItemSection>
        <QItemSection>Réessayer</QItemSection>
      </QItem>
      <QItem
        v-if="isCanceled"
        clickable
        v-close-popup
        class="text-black"
        style="padding: 8px 12px; border-radius: 6px"
        @click="cancelTaxReceipt?.open()"
      >
        <QItemSection style="flex: unset">
          <QIcon name="visibility" />
        </QItemSection>
        <QItemSection>Afficher l'annulation</QItemSection>
      </QItem>
      <QItem
        v-else-if="canCancel"
        clickable
        v-close-popup
        class="text-red-8"
        style="padding: 8px 12px; border-radius: 6px"
        @click="cancelTaxReceipt?.open()"
      >
        <QItemSection style="flex: unset">
          <QIcon name="cancel" />
        </QItemSection>
        <QItemSection> Annuler </QItemSection>
      </QItem>
    </QList>
  </QMenu>
  <CancelTaxReceipt
    ref="cancelTaxReceipt"
    :taxReceipt="taxReceipt"
    @cancel:taxReceipt="$emit('cancel:taxReceipt', $event)"
  />
</template>

<script setup lang="ts">
import { computed, ref, type PropType } from 'vue'

import Btn from '@/components/ui/Btn.vue'
import CancelTaxReceipt from './CancelTaxReceipt.vue'

import type { TaxReceiptListItem } from '@shared/models'
import type { CancelTaxReceiptFormData } from '../types'

const props = defineProps({
  taxReceipt: {
    type: Object as PropType<TaxReceiptListItem>,
    required: true,
  },
})
defineEmits<{
  'cancel:taxReceipt': [formData: CancelTaxReceiptFormData]
  'retry-failed:taxReceipt': [taxReceipt: TaxReceiptListItem]
}>()

const cancelTaxReceipt = ref<InstanceType<typeof CancelTaxReceipt> | null>(null)

const showAction = ref<boolean>(false)
const clickShowAction = (event: Event) => {
  event.stopPropagation()
  showAction.value = !showAction.value
}

const isCanceled = computed(() => props.taxReceipt.status === 'CANCELED')
const canRetry = computed(() => props.taxReceipt.status === 'FAILED')
const canCancel = computed(() => {
  return props.taxReceipt.status === 'COMPLETED' || props.taxReceipt.status === 'FAILED'
})

const showActions = computed(() => {
  return (
    props.taxReceipt.status === 'FAILED' ||
    props.taxReceipt.status === 'COMPLETED' ||
    isCanceled.value
  )
})
</script>
