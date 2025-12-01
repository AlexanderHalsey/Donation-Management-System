<template>
  <QDialog v-model="deleteDialog">
    <QCard>
      <QCardSection class="text-bold" style="font-size: 16px">
        Confirmer la suppression
      </QCardSection>
      <QCardSection>
        Êtes-vous sûr de vouloir supprimer ce type de don ? Cette action est irréversible.
      </QCardSection>
      <QCardActions align="right">
        <Btn flat label="Annuler" v-close-popup />
        <Btn
          flat
          label="Confirmer"
          color="red"
          class="text-white"
          v-close-popup
          @click="$emit('delete:donationType')"
        />
      </QCardActions>
    </QCard>
  </QDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import Btn from '@/components/ui/Btn.vue'

defineEmits<{
  'delete:donationType': []
}>()

const deleteDialog = ref<boolean>(false)
const open = () => {
  deleteDialog.value = true
}

defineExpose({
  open,
})
</script>
