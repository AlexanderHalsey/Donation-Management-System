<template>
  <Btn v-bind="$attrs" icon="more_vert" flat round dense @click="clickShowAction" />
  <QMenu v-model="showAction" style="min-width: 125px; border-radius: 6px">
    <QList dense class="q-pa-xs">
      <QItem
        clickable
        v-close-popup
        :to="'/organisations/' + organisation.id"
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
        @click="deleteOrganisationDialog?.open()"
      >
        <QItemSection style="flex: unset">
          <QIcon name="delete" />
        </QItemSection>
        <QItemSection> Supprimer </QItemSection>
      </QItem>
    </QList>
  </QMenu>
  <DeleteOrganisationDialog
    ref="deleteOrganisationDialog"
    @delete:organisation="$emit('delete:organisation', organisation.id)"
  />
</template>

<script setup lang="ts">
import { ref, type PropType } from 'vue'

import Btn from '@/components/ui/Btn.vue'
import DeleteOrganisationDialog from './DeleteOrganisationDialog.vue'

import type { Organisation } from '@shared/models'

defineProps({
  organisation: {
    type: Object as PropType<Organisation>,
    required: true,
  },
})
defineEmits<{
  'delete:organisation': [organisationId: string]
}>()

const deleteOrganisationDialog = ref<InstanceType<typeof DeleteOrganisationDialog> | null>(null)

const showAction = ref<boolean>(false)
const clickShowAction = (event: Event) => {
  event.stopPropagation()
  showAction.value = !showAction.value
}
</script>
