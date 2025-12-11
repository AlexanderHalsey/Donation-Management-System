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
        <QItemSection> Editer </QItemSection>
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
        <QItemSection> Générer un reçu </QItemSection>
      </QItem>
      <QItem
        clickable
        v-close-popup
        class="text-red-8"
        style="padding: 8px 12px; border-radius: 6px"
        @click="deleteDonationDialog?.open()"
      >
        <QItemSection style="flex: unset">
          <QIcon name="delete" />
        </QItemSection>
        <QItemSection> Supprimer </QItemSection>
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

import Btn from '@/components/ui/Btn.vue'
import DeleteDonationDialog from './DeleteDonationDialog.vue'

import type { DonationListItem } from '@shared/models'

const props = defineProps({
  donation: {
    type: Object as PropType<DonationListItem>,
    required: true,
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
