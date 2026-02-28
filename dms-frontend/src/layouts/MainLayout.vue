<template>
  <QLayout view="lHh LpR lFr" :key="refresh">
    <QHeader reveal bordered class="bg-white text-primary">
      <QToolbar>
        <QBtn dense flat round icon="menu" color="primary" @click="toggleLeftDrawer" />
        <QBreadcrumbs active-color="primary breadcrumbs" gutter="md" class="text-grey q-pl-md">
          <template #separator>
            <QIcon size="1.5em" name="chevron_right" color="primary" />
          </template>
          <QBreadcrumbsEl
            v-for="breadcrumb in breadcrumbs"
            :key="breadcrumb.id"
            :to="breadcrumb.to"
            :label="breadcrumb.label"
            :icon="breadcrumb.icon"
            active-class="text-gray"
          />
        </QBreadcrumbs>
        <QSpace />

        <HelpBtn />
        <LanguageDropdown @update:locale="refresh++" />
        <Logout />
      </QToolbar>
    </QHeader>

    <QDrawer
      :model-value="leftDrawerComputed"
      :mini="leftDrawerMini"
      show-if-above
      side="left"
      bordered
      :width="290"
      :mini-width="90"
      class="bg-grey-1"
    >
      <DMSTitle :showText="!leftDrawerMini" />
      <QScrollArea
        :visible="menuScrollVisible"
        style="height: calc(100% - 51px)"
        @scroll="setMenuScrollVisible"
      >
        <div v-for="group of menuItems" :key="group.group">
          <QList padding class="menu-list q-pt-md q-mx-md">
            <div v-if="group.label" class="q-mt-md">
              <div
                class="text-grey-7"
                :class="{ 'q-ml-md': !leftDrawerMini, 'q-ml-sm': leftDrawerMini }"
              >
                {{ group.label }}
              </div>
            </div>
            <QItem
              v-for="(menuItem, index) of group.items"
              :key="index"
              clickable
              v-ripple
              :to="menuItem.to"
              :active="$route.path.startsWith(menuItem.to)"
              class="q-my-sm"
              active-class="bg-primary text-white shadow-2"
            >
              <QItemSection avatar>
                <QIcon :name="menuItem.icon" />
              </QItemSection>
              <QItemSection>
                {{ menuItem.label }}
              </QItemSection>
            </QItem>
          </QList>
        </div>
      </QScrollArea>
    </QDrawer>

    <QPageContainer>
      <router-view />
    </QPageContainer>
  </QLayout>
</template>

<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import { useI18n } from '@/composables'

import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores'

import HelpBtn from './components/HelpBtn.vue'
import LanguageDropdown from './components/LanguageDropdown.vue'
import Logout from './components/Logout.vue'
import DMSTitle from './components/DMSTitle.vue'

import { setBreadcrumbsInjectionKey } from '@/symbols'
import type { Breadcrumb, MenuItem } from '@/types'

const { t } = useI18n()

const $q = useQuasar()
const authStore = useAuthStore()

const refresh = ref(0)

const hasFullVisualAccess = computed(() => authStore.hasFullVisualAccess)

const menuItems = computed<
  {
    group: string
    label?: string
    items: MenuItem[]
  }[]
>(() => {
  const mainGroup = {
    group: 'main',
    items: [
      { label: t('pages.dashboard'), icon: 'bar_chart', to: '/dashboard' },
      { label: t('nouns.donation', 2), icon: 'volunteer_activism', to: '/donations' },
      { label: t('nouns.donor', 2), icon: 'group', to: '/donors' },
      { label: t('nouns.taxReceipt', 2), icon: 'receipt_long', to: '/tax-receipts' },
    ],
  }
  const adminGroup = {
    group: 'admin',
    label: 'Admin',
    items: [
      { label: t('nouns.organisation', 2), icon: 'account_balance', to: '/organisations' },
      { label: t('nouns.donationType', 2), icon: 'favorite', to: '/donation-types' },
      { label: t('nouns.paymentMode', 2), icon: 'point_of_sale', to: '/payment-modes' },
      { label: t('nouns.donationMethod', 2), icon: 'article', to: '/donation-methods' },
      {
        label: t('nouns.donationAssetType', 2),
        icon: 'payments',
        to: '/donation-asset-types',
      },
    ],
  }
  if (hasFullVisualAccess.value) {
    return [mainGroup, adminGroup]
  } else {
    return [mainGroup]
  }
})

const breadcrumbs = ref<Breadcrumb[]>([])
provide(setBreadcrumbsInjectionKey, (newBreadcrumbs: Breadcrumb[]) => {
  breadcrumbs.value = newBreadcrumbs
})

const leftDrawer = ref<boolean | null>(null)
const leftDrawerMini = ref(false)
function toggleLeftDrawer() {
  if (!$q.screen.gt.sm) {
    leftDrawer.value = !leftDrawer.value
    leftDrawerMini.value = false
  } else {
    leftDrawerMini.value = !leftDrawerMini.value
    leftDrawer.value = null
  }
}
const leftDrawerComputed = computed(() => ($q.screen.gt.sm ? null : leftDrawer.value))

const menuScrollVisible = ref(false)
const setMenuScrollVisible = ({ verticalPosition }: { verticalPosition: number }) => {
  menuScrollVisible.value = verticalPosition > 0
}
</script>

<style lang="scss" scoped>
.breadcrumbs {
  font-size: 12px;
}

.menu-list > .q-item {
  min-height: 42px;
  border-radius: 8px;
}
</style>
