<template>
  <Btn v-bind="$attrs" icon="more_vert" flat round dense @click="clickShowAction" />
  <QMenu v-model="showAction" style="width: 270px; border-radius: 6px">
    <QList dense class="q-pa-xs">
      <QItem
        clickable
        v-close-popup
        :href="donorExternalProviderUrl + donor.externalId"
        target="_blank"
        style="padding: 8px 12px; border-radius: 6px"
      >
        <QItemSection style="flex: unset">
          <QIcon name="contact_page" />
        </QItemSection>
        <QItemSection>
          {{ t('actions.goToProfile', { profileName: donorExternalProviderName }) }}
        </QItemSection>
      </QItem>
    </QList>
  </QMenu>
</template>

<script setup lang="ts">
import { ref, type PropType } from 'vue'
import { useI18n } from '@/composables'

import Btn from '@/components/ui/Btn.vue'

import type { DonorListItem } from '@shared/models'

const { t } = useI18n()

defineProps({
  donor: {
    type: Object as PropType<DonorListItem>,
    required: true,
  },
})

const donorExternalProviderName = import.meta.env.VITE_DONOR_EXTERNAL_PROVIDER_NAME
const donorExternalProviderUrl = import.meta.env.VITE_DONOR_EXTERNAL_PROVIDER_URL

const showAction = ref<boolean>(false)
const clickShowAction = (event: Event) => {
  event.stopPropagation()
  showAction.value = !showAction.value
}
</script>
