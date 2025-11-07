<template>
  <QLayout view="lHh LpR lFr">
    <QHeader reveal bordered class="bg-white text-primary">
      <QToolbar>
        <QBtn dense flat round icon="menu" color="secondary" @click="toggleLeftDrawer" />
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

        <!-- language -->
        <!-- user disconnect -->
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
      <div class="dms-title">
        <QImg
          src="src/assets/img/logo.png"
          alt="DMS Logo"
          fit="contain"
          style="max-width: 56px; height: 24px"
        />

        <template v-if="!leftDrawerMini">DMS</template>
      </div>
      <QScrollArea
        :visible="menuScrollVisible"
        style="height: calc(100% - 51px)"
        @scroll="setMenuScrollVisible"
      >
        <QList padding class="menu-list q-pt-md">
          <QItem
            v-for="(menuItem, index) of menuItems"
            :key="index"
            clickable
            v-ripple
            :to="menuItem.to"
            :active="$route.path.startsWith(menuItem.to)"
            class="q-my-sm q-mx-md"
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
      </QScrollArea>
    </QDrawer>

    <QPageContainer>
      <router-view />
    </QPageContainer>
  </QLayout>
</template>

<script setup lang="ts">
import { computed, provide, ref } from 'vue'

import { useQuasar } from 'quasar'

import { setBreadcrumbsInjectionKey } from '@/symbols'
import type { Breadcrumb, MenuItem } from '@/types'

const $q = useQuasar()

const menuItems: MenuItem[] = [
  { label: 'Tableau de bord', icon: 'speed', to: '/dashboard' },
  { label: 'Dons', icon: 'volunteer_activism', to: '/donations' },
]

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

.dms-title {
  position: sticky;
  top: 0;
  color: $secondary;
  background: inherit;
  z-index: 1;
  height: 51px;
  min-width: 1px;
  max-width: 100%;
  padding: 0 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: start;
  gap: 14px;
  font-size: 21px;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.menu-list > .q-item {
  min-height: 42px;
  border-radius: 10px;
}
</style>
