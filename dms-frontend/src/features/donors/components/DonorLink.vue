<template>
  <RouterLink
    :to="{
      name: 'donor-detail',
      params: { donorId: donor.id },
    }"
    class="text-bold text-primary"
  >
    {{ getDonorFullName(donor) }}
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
