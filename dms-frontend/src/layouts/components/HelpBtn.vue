<template>
  <Btn flat dense icon="help" color="primary" no-caps>
    Aide
    <QMenu :offset="[0, 8]">
      <QList>
        <QItem clickable>
          <QItemSection thumbnail>
            <QIcon name="keyboard_arrow_left" />
          </QItemSection>
          <QItemSection> Liste des dons </QItemSection>
          <QMenu self="top left" anchor="top right" :offset="[8, 0]">
            <div class="q-pa-md" style="min-width: 180px">
              <div
                v-for="({ className, label }, index) in DONATION_STATUS_OPTIONS"
                :key="index"
                :class="'row items-center ' + (index === 0 ? '' : 'q-mt-md')"
              >
                <div :class="'help-item ' + className"></div>
                {{ label }}
              </div>
            </div>
          </QMenu>
        </QItem>
      </QList>
    </QMenu>
  </Btn>
</template>

<script setup lang="ts">
import Btn from '@/components/ui/Btn.vue'

import { DONATION_STATUS_OPTIONS } from '@/features/donations/helpers'
import { QItemSection } from 'quasar'
</script>

<style lang="scss" scoped>
.help-item {
  width: 25px;
  height: 18px;
  margin-right: 10px;
  border-radius: 4px;
}
</style>
