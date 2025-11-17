<template>
  <Btn v-bind="$attrs" icon="more_vert" flat round dense @click="clickShowAction" />
  <QMenu v-model="showAction" style="width: 270px; border-radius: 6px">
    <QList dense class="q-pa-xs">
      <QItem
        clickable
        v-close-popup
        :href="externalProvider.url + donor.externalId"
        target="_blank"
        style="padding: 8px 12px; border-radius: 6px"
      >
        <QItemSection style="flex: unset">
          <QIcon name="contact_page" />
        </QItemSection>
        <QItemSection> Accèder au profil {{ externalProvider.name }} </QItemSection>
      </QItem>
    </QList>
  </QMenu>
</template>

<script setup lang="ts">
import { ref, type PropType } from 'vue'

import Btn from '@/components/ui/Btn.vue'

import type { DonorListItem } from '@shared/models'

defineProps({
  donor: {
    type: Object as PropType<DonorListItem>,
    required: true,
  },
})

// TODO : implement external provider
const externalProvider = ref<{ name: string; url: string }>({
  name: 'External Provider',
  url: 'https://external-provider.com/profile/',
})

const showAction = ref<boolean>(false)
const clickShowAction = (event: Event) => {
  event.stopPropagation()
  showAction.value = !showAction.value
}
</script>
