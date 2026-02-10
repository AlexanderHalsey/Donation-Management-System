<template>
  <Btn v-bind="$attrs" icon="more_vert" flat round dense @click="clickShowAction" />
  <QMenu v-model="showAction" style="min-width: 125px; border-radius: 6px">
    <QList dense class="q-pa-xs">
      <QItem
        clickable
        v-close-popup
        :to="'/donation-types/' + donationType.id"
        style="padding: 8px 12px; border-radius: 6px"
      >
        <QItemSection style="flex: unset">
          <QIcon name="edit" />
        </QItemSection>
        <QItemSection> {{ t('actions.edit') }} </QItemSection>
      </QItem>
      <QItem
        clickable
        v-close-popup
        class="text-red-8"
        style="padding: 8px 12px; border-radius: 6px"
        @click="deleteDonationTypeDialog?.open()"
      >
        <QItemSection style="flex: unset">
          <QIcon name="delete" />
        </QItemSection>
        <QItemSection> {{ t('actions.delete') }} </QItemSection>
      </QItem>
    </QList>
  </QMenu>
  <DeleteDonationTypeDialog
    ref="deleteDonationTypeDialog"
    @delete:donationType="$emit('delete:donationType', donationType.id)"
  />
</template>

<script setup lang="ts">
import { ref, type PropType } from 'vue'
import { useI18n } from '@/composables'

import Btn from '@/components/ui/Btn.vue'
import DeleteDonationTypeDialog from './DeleteDonationTypeDialog.vue'

import type { DonationType } from '@shared/models'

const { t } = useI18n()

defineProps({
  donationType: {
    type: Object as PropType<DonationType>,
    required: true,
  },
})
defineEmits<{
  'delete:donationType': [donationTypeId: string]
}>()

const deleteDonationTypeDialog = ref<InstanceType<typeof DeleteDonationTypeDialog> | null>(null)

const showAction = ref<boolean>(false)
const clickShowAction = (event: Event) => {
  event.stopPropagation()
  showAction.value = !showAction.value
}
</script>
