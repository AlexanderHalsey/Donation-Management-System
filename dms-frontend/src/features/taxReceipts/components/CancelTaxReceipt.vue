<template>
  <QDialog v-model="cancelDialog">
    <QCard>
      <QCardSection class="text-bold" style="font-size: 16px">
        Confirmer l'annulation
      </QCardSection>
      <QCardSection>
        Êtes-vous sûr de vouloir annuler ce reçu fiscal ? Cette action est irréversible.
      </QCardSection>
      <QCardActions align="right">
        <Btn flat label="Annuler" v-close-popup />
        <Btn
          flat
          label="Confirmer"
          color="red"
          class="text-white"
          v-close-popup
          @click="$emit('cancel:taxReceipt')"
        />
      </QCardActions>
    </QCard>
  </QDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import Btn from '@/components/ui/Btn.vue'

defineEmits<{
  'cancel:taxReceipt': []
}>()

const cancelDialog = ref<boolean>(false)
const open = () => {
  cancelDialog.value = true
}

defineExpose({
  open,
})
</script>
