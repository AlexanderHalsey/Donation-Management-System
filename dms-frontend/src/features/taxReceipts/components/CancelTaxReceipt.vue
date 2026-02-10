<template>
  <QDialog v-model="cancelDialog" maximized>
    <QCard style="width: 660px; height: auto">
      <QCardSection class="text-bold" style="font-size: 18px">
        {{
          isCanceled ? t('labels.cancelledTaxReceipt') : t('actions.confirmTaxReceiptCancellation')
        }}
      </QCardSection>
      <QCardSection v-if="!isCanceled" class="text-center text-italic">
        {{ t('questions.sureToCancelTaxReceipt') }}
      </QCardSection>
      <QCardSection v-if="!isCanceled">
        <label for="canceledReason" class="text-bold text-right">
          {{ t('labels.cancellationReason') }}
        </label>

        <Input
          type="textarea"
          :id="'canceledReason'"
          v-model="canceledReason"
          v-bind="canceledReasonAttrs"
          :hint="t('placeholders.cancellationReasonHint')"
          :error="errors.canceledReason"
          maxlength="500"
          rows="5"
          class="q-mt-md"
        />
      </QCardSection>
      <QCardSection v-else class="flex items-center text-center">
        <label for="canceledReason" class="text-bold text-right q-pr-lg">
          {{ t('labels.cancellationReason') }} :
        </label>
        <div>
          {{ taxReceipt.canceledReason }}
        </div>
      </QCardSection>
      <QCardActions align="right">
        <Btn flat :label="isCanceled ? t('common.close') : t('common.cancel')" v-close-popup />
        <Btn
          v-if="!isCanceled"
          flat
          :label="t('common.confirm')"
          color="red"
          class="text-white"
          @click="validate()"
        />
      </QCardActions>
    </QCard>
  </QDialog>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, type PropType } from 'vue'
import { useI18n } from '@/composables'

import Btn from '@/components/ui/Btn.vue'
import Input from '@/components/ui/Input.vue'

import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { cancelTaxReceiptSchema } from '../schemas'

import type { CancelTaxReceiptFormData } from '../types'
import type { TaxReceiptListItem } from '@shared/models'

const { t } = useI18n()

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

const isCanceled = computed(() => props.taxReceipt.status === 'CANCELED')

const { defineField, errors, handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(cancelTaxReceiptSchema),
})

const [canceledReason, canceledReasonAttrs] = defineField('canceledReason')

onBeforeUnmount(() => {
  resetForm()
})

const validate = handleSubmit((formData) => {
  if (isCanceled.value) {
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
