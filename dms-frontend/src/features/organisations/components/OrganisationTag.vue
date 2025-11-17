<template>
  <div class="tag" :style="style">{{ organisation.name }}</div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'

import type { OrganisationRef } from '@shared/models'
import type { Tag } from '@/types'

const props = defineProps({
  organisation: {
    type: Object as PropType<OrganisationRef>,
    required: true,
  },
  organisationOptions: {
    type: Array as PropType<OrganisationRef[]>,
    required: true,
  },
})

const options: Tag[] = [
  { backgroundColor: '#EDE7F6', color: '#311B92' },
  { backgroundColor: '#E8F5E9', color: '#1B5E20' },
  { backgroundColor: '#E0F7FA', color: '#006064' },
  { backgroundColor: '#FFF3E0', color: '#E65100' },
  // add more options as needed
]

const style = computed(() => {
  const index = props.organisationOptions.findIndex((org) => org.id === props.organisation.id)
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
