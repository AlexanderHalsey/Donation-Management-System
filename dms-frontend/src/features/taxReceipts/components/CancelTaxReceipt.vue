<template>
  <QDialog v-model="cancelDialog" maximized>
    <QCard style="width: 660px; height: auto">
      <QCardSection class="text-bold" style="font-size: 18px">
        {{ taxReceipt.isCanceled ? 'Reçu annulé' : "Confirmer l'annulation" }}
      </QCardSection>
      <QCardSection v-if="!taxReceipt.isCanceled" class="text-center text-italic">
        Êtes-vous sûr de vouloir annuler ce reçu fiscal ? Cette action est irréversible.
      </QCardSection>
      <QCardSection v-if="!taxReceipt.isCanceled">
        <label for="canceledReason" class="text-bold text-right"> Raison de l'annulation </label>

        <Input
          type="textarea"
          :id="'canceledReason'"
          v-model="canceledReason"
          v-bind="canceledReasonAttrs"
          hint="Veuillez indiquer la raison de l'annulation du reçu fiscal."
          :error="errors.canceledReason"
          maxlength="500"
          rows="5"
          class="q-mt-md"
        />
      </QCardSection>
      <QCardSection v-else class="flex items-center text-center">
        <label for="canceledReason" class="text-bold text-right q-pr-lg">
          Raison de l'annulation :
        </label>
        <div>
          {{ taxReceipt.canceledReason }}
        </div>
      </QCardSection>
      <QCardActions align="right">
        <Btn flat :label="taxReceipt.isCanceled ? 'Fermer' : 'Annuler'" v-close-popup />
        <Btn
          v-if="!taxReceipt.isCanceled"
          flat
          label="Confirmer"
          color="red"
          class="text-white"
          @click="validate()"
        />
      </QCardActions>
    </QCard>
  </QDialog>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, type PropType } from 'vue'

import Btn from '@/components/ui/Btn.vue'
import Input from '@/components/ui/Input.vue'

import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { cancelTaxReceiptSchema } from '../schemas'

import type { CancelTaxReceiptFormData } from '../types'
import type { TaxReceiptListItem } from '@shared/models'

const props = defineProps({
  taxReceipt: {
    type: Object as PropType<TaxReceiptListItem>,
    required: true,
  },
})

const emit = defineEmits<{
  'cancel:taxReceipt': [formData: CancelTaxReceiptFormData]
}>()

const cancelDialog = ref<boolean>(false)
const open = () => {
  cancelDialog.value = true
}

const { defineField, errors, handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(cancelTaxReceiptSchema),
})

const [canceledReason, canceledReasonAttrs] = defineField('canceledReason')

onBeforeUnmount(() => {
  resetForm()
})

const validate = handleSubmit((formData) => {
  if (props.taxReceipt.isCanceled) {
    // If the receipt is already canceled, we just want to view the cancellation reason
    cancelDialog.value = false
    return
  }
  emit('cancel:taxReceipt', { ...formData, id: props.taxReceipt.id })
  cancelDialog.value = false
})

defineExpose({
  open,
})
</script>
