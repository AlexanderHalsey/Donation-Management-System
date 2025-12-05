<template>
  <QFile
    v-bind="props"
    v-model="file"
    dense
    outlined
    use-chips
    :accept="fileTypeConfig.accept"
    :loading="isUploading"
    :error="!!computedError"
    :error-message="computedError"
    @update:model-value="uploadFile"
  >
    <template v-for="(_, slot) of $slots" #[slot]="scope">
      <slot :name="slot" v-bind="scope || {}"></slot>
    </template>
    <template v-if="modelValue" #after>
      <Btn flat icon="open_in_browser" @click="viewFile" style="padding: 8px" />
    </template>
    <QChip v-if="modelValue" :removable="!isUploading" @remove="uploadFile(undefined)">
      <QAvatar>
        <QIcon :name="fileTypeConfig.icon" />
      </QAvatar>

      <div class="ellipsis relative-position">
        {{ modelValue.name }}
      </div>
    </QChip>
  </QFile>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { AxiosError } from 'axios'

import Btn from '@/components/ui/Btn.vue'

import { uploadImage } from '@/apis/dms-api'

import type { QFileProps } from 'quasar'

type FileType = 'image' // add more file types as needed

type FormFile = {
  id: string
  name: string
}

const props = defineProps<
  Omit<QFileProps, 'error' | 'modelValue' | 'onUpdate:modelValue'> & {
    modelValue?: FormFile
    error?: string
    fileType: FileType
  }
>()

const emit = defineEmits<{
  (e: 'update:model-value', value?: FormFile): void
}>()

type FileInfo = {
  icon: string
  accept: string
  upload: (file: File) => Promise<{ id: string }>
}

const file = ref<File>()
const fileTypeConfig = computed<FileInfo>(
  () =>
    (
      ({
        image: {
          icon: 'photo',
          accept: '.jpg, .jpeg, .png, .gif, .bmp, .webp',
          upload: uploadImage,
        },
      }) satisfies Record<FileType, FileInfo>
    )[props.fileType],
)

const isUploading = ref(false)
const internalError = ref<string>()

const computedError = computed(() => {
  return props.error || internalError.value
})

const uploadFile = async (newFile?: File) => {
  isUploading.value = true
  try {
    let formFile: FormFile | undefined
    if (newFile) {
      const { id } = await fileTypeConfig.value.upload(newFile)
      formFile = { id, name: newFile.name }
      file.value = newFile
    } else {
      file.value = undefined
    }
    emit('update:model-value', formFile)
  } catch (err: unknown) {
    console.error('File upload failed', err)
    let error = 'File upload failed. Please try again.'
    if (err instanceof AxiosError && err.response?.data.message) {
      error = err.response?.data?.message
    }
    internalError.value = error
  } finally {
    isUploading.value = false
  }
}

const viewFile = async () => {
  if (!props.modelValue) return
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
  window.open(`${apiBaseUrl}/files/${props.modelValue.id}`, '_blank')
}
</script>

<style lang="scss" scoped>
:deep() {
  .q-field__control-container {
    align-items: center;
    .q-field__native {
      display: none;
    }
  }
  .q-chip__icon {
    margin-left: 12px;
  }
}
</style>
