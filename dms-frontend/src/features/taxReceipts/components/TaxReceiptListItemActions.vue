<template>
  <Btn v-bind="$attrs" icon="more_vert" flat round dense @click="clickShowAction" />
  <QMenu v-model="showAction" style="min-width: 125px; border-radius: 6px">
    <QList dense class="q-pa-xs">
      <QItem
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
    @cancel:taxReceipt="$emit('cancel:taxReceipt', taxReceipt.id)"
  />
</template>

<script setup lang="ts">
import { ref, type PropType } from 'vue'

import Btn from '@/components/ui/Btn.vue'
import CancelTaxReceipt from './CancelTaxReceipt.vue'

import type { TaxReceiptListItem } from '@shared/models'

defineProps({
  taxReceipt: {
    type: Object as PropType<TaxReceiptListItem>,
    required: true,
  },
})
defineEmits<{
  'cancel:taxReceipt': [taxReceiptId: string]
}>()

const cancelTaxReceipt = ref<InstanceType<typeof CancelTaxReceipt> | null>(null)

const showAction = ref<boolean>(false)
const clickShowAction = (event: Event) => {
  event.stopPropagation()
  showAction.value = !showAction.value
}
</script>
