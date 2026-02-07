<template>
  <Page title="Tableau de bord" :breadcrumbs="breadcrumbs">
    <template #actions>
      <QTabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        data-cy="dashboard-tabs"
      >
        <QTab name="donations" label="Dons" no-caps />
        <QTab
          name="donors"
          :label="`Donateurs${!!disabledDonors?.length ? '&nbsp;&nbsp;&nbsp;⚠️' : ''}`"
          no-caps
        />
        <QTab
          name="tax-receipts"
          :label="`Reçus fiscaux${!!dashboardSummaries?.taxReceiptStatusCounts.FAILED ? '&nbsp;&nbsp;&nbsp;⚠️' : ''}`"
          no-caps
        />
      </QTabs>
    </template>

    <QTabPanels v-model="tab" animated>
      <QTabPanel name="donations" style="padding: 2px">
        <DashboardDonationsTab
          :total-donations="totalDonations"
          :charts="donationCharts"
          :current-week-donations="currentWeekDonations"
        />
      </QTabPanel>

      <QTabPanel name="donors" style="padding: 2px">
        <div class="q-gutter-y-md">
          <DashboardDonorsTab
            :top-donors-by-amount="topDonorsByAmount"
            :top-donors-by-count="topDonorsByCount"
            :disabled-donors="disabledDonors"
          />
        </div>
      </QTabPanel>

      <QTabPanel name="tax-receipts" style="padding: 2px">
        <DashboardTaxReceiptsTab :status-counts="dashboardSummaries?.taxReceiptStatusCounts" />
      </QTabPanel>
    </QTabPanels>
  </Page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import Page from '@/layouts/Page.vue'

import { useDashboardStore } from '@/stores'

import DashboardDonationsTab from '../components/DashboardDonationsTab.vue'
import DashboardDonorsTab from '../components/DashboardDonorsTab.vue'
import DashboardTaxReceiptsTab from '../components/DashboardTaxReceiptsTab.vue'

import type { Breadcrumb } from '@/types'

const tab = ref('donations')

const breadcrumbs: Breadcrumb[] = [{ id: 'dashboard', label: 'Tableau de bord', icon: 'bar_chart' }]

const dashboardStore = useDashboardStore()

const dashboardSummaries = computed(() => dashboardStore.dashboardSummaries)

const totalDonations = computed(() => dashboardSummaries.value?.totalDonations)
const donationCharts = computed(() => dashboardSummaries.value?.donationCharts)
const currentWeekDonations = computed(() => dashboardSummaries.value?.currentWeekDonations)

const topDonorsByAmount = computed(() => dashboardSummaries.value?.topDonors.byAmount)
const topDonorsByCount = computed(() => dashboardSummaries.value?.topDonors.byCount)
const disabledDonors = computed(() => dashboardSummaries.value?.disabledDonorsWithDonations)

onMounted(() => {
  dashboardStore.getSummaries()
})
</script>
