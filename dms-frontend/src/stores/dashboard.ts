import { ref } from 'vue'
import { defineStore } from 'pinia'

import { getDashboardSummaries } from '@/apis/dms-api'

import type { DashboardSummaries } from '@shared/models'

export const useDashboardStore = defineStore('dashboard', () => {
  const dashboardSummaries = ref<DashboardSummaries>()

  const getSummaries = async () => {
    dashboardSummaries.value = await getDashboardSummaries()
    return dashboardSummaries.value
  }

  return {
    dashboardSummaries,
    getSummaries,
  }
})
