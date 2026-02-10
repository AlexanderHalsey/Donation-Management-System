<template>
  <div>
    <BtnDropdown dense flat icon="language" color="primary" dropdown-icon="none" class="q-ml-md">
      <QList>
        <QItem
          :active="isLocaleActive('fr')"
          :clickable="!isLocaleActive('fr')"
          v-close-popup
          @click="setLocale('fr')"
        >
          <QItemSection>
            <QItemLabel>{{ t('common.french') }}</QItemLabel>
          </QItemSection>
        </QItem>
        <QItem
          :active="isLocaleActive('en')"
          :clickable="!isLocaleActive('en')"
          v-close-popup
          @click="setLocale('en')"
        >
          <QItemSection>
            <QItemLabel>{{ t('common.english') }}</QItemLabel>
          </QItemSection>
        </QItem>
      </QList>
    </BtnDropdown>
    <QTooltip :delay="100">{{ t('common.language') }}</QTooltip>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables'

import { useLocaleStore } from '@/stores'

import BtnDropdown from '@/components/ui/BtnDropdown.vue'

const { locale, t } = useI18n()
const localeStore = useLocaleStore()

const emit = defineEmits(['update:locale'])

const isLocaleActive = (checkLocale: string) => {
  return locale.value === checkLocale
}

const setLocale = (newLocale: 'fr' | 'en') => {
  if (isLocaleActive(newLocale)) return
  locale.value = newLocale
  localeStore.setLocale(newLocale)
  emit('update:locale', newLocale)
}
</script>

<style lang="scss" scoped>
:deep() {
  .q-btn-dropdown__arrow {
    display: none;
  }
}
</style>
