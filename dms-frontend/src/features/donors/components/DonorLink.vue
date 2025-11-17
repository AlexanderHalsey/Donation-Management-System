<template>
  <RouterLink
    :to="{
      name: 'donor-detail',
      params: { donorId: donor.id },
    }"
    class="text-bold text-primary donor-link"
  >
    {{ getDonorFullName(donor) }}
    <QTooltip v-if="donor.isDisabled" :delay="300" :offset="[10, 10]">
      Donateur désactivé
    </QTooltip>
  </RouterLink>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

import { getDonorFullName } from '../helpers'

import type { DonorRef } from '@shared/models'

defineProps({
  donor: {
    type: Object as PropType<DonorRef>,
    required: true,
  },
})
</script>

<style lang="scss" scoped>
.donor-link:not(:hover) {
  text-decoration: none;
}
</style>
