<template>
  <Btn v-bind="$attrs" icon="more_vert" flat round dense @click="clickShowAction" />
  <QMenu v-model="showAction" style="min-width: 125px; border-radius: 6px">
    <QList dense class="q-pa-xs">
      <QItem
        clickable
        v-close-popup
        :to="'/donation-asset-types/' + donationAssetType.id"
        style="padding: 8px 12px; border-radius: 6px"
      >
        <QItemSection style="flex: unset">
          <QIcon name="edit" />
        </QItemSection>
        <QItemSection> Editer </QItemSection>
      </QItem>
      <QItem
        clickable
        v-close-popup
        class="text-red-8"
        style="padding: 8px 12px; border-radius: 6px"
        @click="deleteDonationAssetTypeDialog?.open()"
      >
        <QItemSection style="flex: unset">
          <QIcon name="delete" />
        </QItemSection>
        <QItemSection> Supprimer </QItemSection>
      </QItem>
    </QList>
  </QMenu>
  <DeleteDonationAssetTypeDialog
    ref="deleteDonationAssetTypeDialog"
    @delete:donationAssetType="$emit('delete:donationAssetType', donationAssetType.id)"
  />
</template>

<script setup lang="ts">
import { ref, type PropType } from 'vue'

import Btn from '@/components/ui/Btn.vue'
import DeleteDonationAssetTypeDialog from './DeleteDonationAssetTypeDialog.vue'

import type { DonationAssetType } from '@shared/models'

defineProps({
  donationAssetType: {
    type: Object as PropType<DonationAssetType>,
    required: true,
  },
})
defineEmits<{
  'delete:donationAssetType': [donationAssetTypeId: string]
}>()

const deleteDonationAssetTypeDialog = ref<InstanceType<
  typeof DeleteDonationAssetTypeDialog
> | null>(null)

const showAction = ref<boolean>(false)
const clickShowAction = (event: Event) => {
  event.stopPropagation()
  showAction.value = !showAction.value
}
</script>
