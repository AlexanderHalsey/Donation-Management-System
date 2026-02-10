<template>
  <div>
    <Btn dense flat round icon="logout" color="primary" class="q-ml-md" @click="logout" />
    <QTooltip :delay="100">{{ t('common.logout') }}</QTooltip>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores'

import Btn from '@/components/ui/Btn.vue'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const logout = async () => {
  await authStore.logout()
  await router.push({ name: 'login' })
}
</script>

<style scoped></style>
