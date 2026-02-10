<template>
  <Btn v-bind="$attrs" icon="more_vert" flat round dense @click="clickShowAction" />
  <QMenu v-model="showAction" style="min-width: 125px; border-radius: 6px">
    <QList dense class="q-pa-xs">
      <QItem
        clickable
        v-close-popup
        :to="'/donations/' + donation.id"
        style="padding: 8px 12px; border-radius: 6px"
      >
        <QItemSection style="flex: unset">
          <QIcon name="edit" />
        </QItemSection>
        <QItemSection> {{ t('actions.edit') }} </QItemSection>
      </QItem>
      <QItem
        v-if="isTaxReceiptEnabled"
        clickable
        v-close-popup
        @click="$emit('create:tax-receipt', donation.id)"
        style="padding: 8px 12px; border-radius: 6px; width: 150px"
      >
        <QItemSection style="flex: unset">
          <QIcon name="receipt_long" />
        </QItemSection>
        <QItemSection> {{ t('actions.generateReceipt') }} </QItemSection>
      </QItem>
      <QItem
        v-if="userRole === 'admin'"
        clickable
        v-close-popup
        class="text-red-8"
        style="padding: 8px 12px; border-radius: 6px"
        @click="deleteDonationDialog?.open()"
      >
        <QItemSection style="flex: unset">
          <QIcon name="delete" />
        </QItemSection>
        <QItemSection> {{ t('actions.delete') }} </QItemSection>
      </QItem>
    </QList>
  </QMenu>
  <DeleteDonationDialog
    ref="deleteDonationDialog"
    @delete:donation="$emit('delete:donation', donation.id)"
  />
</template>

<script setup lang="ts">
import { computed, ref, type PropType } from 'vue'
import { useI18n } from '@/composables'

import Btn from '@/components/ui/Btn.vue'
import DeleteDonationDialog from './DeleteDonationDialog.vue'

import type { DonationListItem, UserRole } from '@shared/models'

const { t } = useI18n()

const props = defineProps({
  donation: {
    type: Object as PropType<DonationListItem>,
    required: true,
  },
  userRole: {
    type: String as PropType<UserRole | null>,
    default: undefined,
  },
})
defineEmits<{
  'delete:donation': [donationId: string]
  'create:tax-receipt': [donationId: string]
}>()

const deleteDonationDialog = ref<InstanceType<typeof DeleteDonationDialog> | null>(null)

const showAction = ref<boolean>(false)
const clickShowAction = (event: Event) => {
  event.stopPropagation()
  showAction.value = !showAction.value
}

const isTaxReceiptEnabled = computed(
  () => props.donation.isTaxReceiptEnabled && !props.donation.taxReceiptId,
)
</script>
