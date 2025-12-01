<template>
  <Btn v-bind="$attrs" icon="more_vert" flat round dense @click="clickShowAction" />
  <QMenu v-model="showAction" style="min-width: 125px; border-radius: 6px">
    <QList dense class="q-pa-xs">
      <QItem
        clickable
        v-close-popup
        :to="'/donation-methods/' + donationMethod.id"
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
        @click="deleteDonationMethodDialog?.open()"
      >
        <QItemSection style="flex: unset">
          <QIcon name="delete" />
        </QItemSection>
        <QItemSection> Supprimer </QItemSection>
      </QItem>
    </QList>
  </QMenu>
  <DeleteDonationMethodDialog
    ref="deleteDonationMethodDialog"
    @delete:donationMethod="$emit('delete:donationMethod', donationMethod.id)"
  />
</template>

<script setup lang="ts">
import { ref, type PropType } from 'vue'

import Btn from '@/components/ui/Btn.vue'
import DeleteDonationMethodDialog from './DeleteDonationMethodDialog.vue'

import type { DonationMethod } from '@shared/models'

defineProps({
  donationMethod: {
    type: Object as PropType<DonationMethod>,
    required: true,
  },
})
defineEmits<{
  'delete:donationMethod': [donationMethodId: string]
}>()

const deleteDonationMethodDialog = ref<InstanceType<typeof DeleteDonationMethodDialog> | null>(null)

const showAction = ref<boolean>(false)
const clickShowAction = (event: Event) => {
  event.stopPropagation()
  showAction.value = !showAction.value
}
</script>
