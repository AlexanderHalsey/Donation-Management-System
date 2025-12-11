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
    case 'ANNUAL':
      return 'Annuel'
    case 'INDIVIDUAL':
      return 'Individuel'
    default:
      return props.taxReceiptType
  }
})

const options: Tag[] = [
  { backgroundColor: '#E3F2FD', color: '#006064' },
  { backgroundColor: '#EDE7F6', color: '#311B92' },
  // add more options as needed
]

const style = computed(() => {
  const index = props.taxReceiptType === 'ANNUAL' ? 0 : 1
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
