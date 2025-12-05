<template>
  <div class="tag" :style="style">{{ label }}</div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'

import type { TaxReceiptType } from '@shared/models'
import type { Tag } from '@/types'

const props = defineProps({
  taxReceiptType: {
    type: String as PropType<TaxReceiptType>,
    required: true,
  },
})

const label = computed(() => {
  switch (props.taxReceiptType) {
    case 'annual':
      return 'Annuel'
    case 'individual':
      return 'Individuel'
    default:
      return props.taxReceiptType
  }
})

const options: Tag[] = [
  { backgroundColor: '#E0F7FA', color: '#006064' },
  { backgroundColor: '#FFF3E0', color: '#E65100' },
  // add more options as needed
]

const style = computed(() => {
  const index = props.taxReceiptType === 'annual' ? 0 : 1
  return {
    backgroundColor: options[index]?.backgroundColor,
    color: options[index]?.color,
  }
})
</script>

<style scoped>
.tag {
  padding: 4px 4px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
