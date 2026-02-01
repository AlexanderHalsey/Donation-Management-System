<template>
  <QDialog v-model="annualReceiptsDialog">
    <QCard>
      <QCardSection class="text-bold" style="font-size: 16px">
        Confirmer la création des reçus fiscaux annuels
      </QCardSection>
      <QCardSection>
        <div class="column items-center">
          <div>
            <div class="text-bold">Récapitulatif</div>
            <div class="flex">
              <div class="column">
                <div>Total des reçus fiscaux à créer :</div>
                <div>Total des reçus a envoyer par email :</div>
              </div>
              <div class="column q-ml-md">
                <div>
                  <span class="text-bold" data-cy="total-created">{{ totalCreated }}</span>
                </div>
                <div>
                  <span class="text-bold" data-cy="total-sent">{{ totalEmailsSent }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </QCardSection>
      <QCardSection>
        <div class="column items-center">
          Êtes-vous sûr de vouloir créer ces reçus fiscaux annuels ? Cette action est irréversible.
        </div>
      </QCardSection>
      <QCardActions align="right">
        <Btn flat label="Annuler" v-close-popup />
        <Btn
          label="Confirmer"
          color="primary"
          class="text-white"
          v-close-popup
          @click="$emit('create:annualTaxReceipts')"
        />
      </QCardActions>
    </QCard>
  </QDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import Btn from '@/components/ui/Btn.vue'

defineProps({
  totalCreated: {
    type: Number,
    required: true,
  },
  totalEmailsSent: {
    type: Number,
    required: true,
  },
})

defineEmits<{
  'create:annualTaxReceipts': []
}>()

const annualReceiptsDialog = ref<boolean>(false)
const open = () => {
  annualReceiptsDialog.value = true
}

defineExpose({
  open,
})
</script>
