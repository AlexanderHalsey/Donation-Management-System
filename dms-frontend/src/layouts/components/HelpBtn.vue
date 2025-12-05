<template>
  <Btn flat dense icon="help" color="primary" no-caps>
    Aide
    <QMenu :offset="[0, 8]" style="width: 300px">
      <QList>
        <QItem>
          <QItemSection>
            <div class="text-subtitle1 text-weight-bold q-mb-xs">
              <QIcon name="volunteer_activism" class="q-mr-sm" />
              Dons
            </div>
            <TitledComponent title="Dons avec reçu fiscal">
              <div class="list-item-line bg-green-2">
                <span class="text-primary text-bold">NOM Prénom</span>
                &emsp;...&emsp;...&emsp;...&emsp;...&emsp;...&emsp;...
              </div>
            </TitledComponent>
            <TitledComponent title="Donateur désactivé">
              <div class="text-primary text-bold">🚫 NOM Prénom</div>
            </TitledComponent>
            <QSeparator class="q-my-sm" />
            <div class="text-subtitle1 text-weight-bold q-mb-xs">
              <QIcon name="person" class="q-mr-sm" />
              Donateurs
            </div>
            <TitledComponent title="Donateur désactivé">
              <div class="text-primary text-bold">🚫 NOM Prénom</div>
            </TitledComponent>
            <QSeparator class="q-my-sm" />
            <div class="text-subtitle1 text-weight-bold q-mb-xs">
              <QIcon name="receipt_long" class="q-mr-sm" />
              Reçus fiscaux
            </div>
            <TitledComponent title="Reçu fiscal annulé">
              <div class="list-item-line bg-red-2">
                <span class="text-primary text-bold">1000&emsp; NOM Prénom</span>
                &emsp;...&emsp;...&emsp;...&emsp;...
              </div>
            </TitledComponent>
            <TitledComponent title="Donateur désactivé">
              <div class="text-primary text-bold">🚫 NOM Prénom</div>
            </TitledComponent>
          </QItemSection>
        </QItem>
      </QList>
    </QMenu>
  </Btn>
</template>

<script setup lang="ts">
import TitledComponent from '@/components/TitledComponent.vue'
import Btn from '@/components/ui/Btn.vue'

import { QItemSection } from 'quasar'
</script>

<style lang="scss" scoped>
.list-item-line {
  width: 100%;
  height: 25px;
  padding: 1px 8px;
  border-top: 1px solid lightgrey;
  border-bottom: 1px solid lightgrey;
}
</style>
