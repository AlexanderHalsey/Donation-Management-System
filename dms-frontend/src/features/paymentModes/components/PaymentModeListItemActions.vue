<template>
  <Btn v-bind="$attrs" icon="more_vert" flat round dense @click="clickShowAction" />
  <QMenu v-model="showAction" style="min-width: 125px; border-radius: 6px">
    <QList dense class="q-pa-xs">
      <QItem
        clickable
        v-close-popup
        :to="'/payment-modes/' + paymentMode.id"
        style="padding: 8px 12px; border-radius: 6px"
      >
        <QItemSection style="flex: unset">
          <QIcon name="edit" />
        </QItemSection>
        <QItemSection>{{ t('actions.edit') }}</QItemSection>
      </QItem>
      <QItem
        clickable
        v-close-popup
        class="text-red-8"
        style="padding: 8px 12px; border-radius: 6px"
        @click="deletePaymentModeDialog?.open()"
      >
        <QItemSection style="flex: unset">
          <QIcon name="delete" />
        </QItemSection>
        <QItemSection>{{ t('actions.delete') }}</QItemSection>
      </QItem>
    </QList>
  </QMenu>
  <DeletePaymentModeDialog
    ref="deletePaymentModeDialog"
    @delete:paymentMode="$emit('delete:paymentMode', paymentMode.id)"
  />
</template>

<script setup lang="ts">
import { ref, type PropType } from 'vue'
import { useI18n } from '@/composables'

import Btn from '@/components/ui/Btn.vue'
import DeletePaymentModeDialog from './DeletePaymentModeDialog.vue'

import type { PaymentMode } from '@shared/models'

const { t } = useI18n()

defineProps({
  paymentMode: {
    type: Object as PropType<PaymentMode>,
    required: true,
  },
})
defineEmits<{
  'delete:paymentMode': [paymentModeId: string]
}>()

const deletePaymentModeDialog = ref<InstanceType<typeof DeletePaymentModeDialog> | null>(null)

const showAction = ref<boolean>(false)
const clickShowAction = (event: Event) => {
  event.stopPropagation()
  showAction.value = !showAction.value
}
</script>
