<template>
  <Page title="Modifier le don" :breadcrumbs="breadcrumbs" :loading="loading">
    {{ donation }}
  </Page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import Page from '@/layouts/Page.vue'

import { useDonationStore } from '@/stores'

import type { Breadcrumb } from '@/types'

const breadcrumbs: Breadcrumb[] = [
  { id: 'donation-list', label: 'Liste des dons', to: '/donations', icon: 'volunteer_activism' },
  { id: 'donation-update', label: 'Modifier le don', icon: 'edit' },
]

const donationStore = useDonationStore()
const route = useRoute()

const donationId = computed(() => route.params.id as string)

const donation = computed(() => {
  const donation = donationStore.donationList.find((donation) => donation.id === donationId.value)
  if (!donation) {
    throw new Error('Donation not found')
  }
  return donation
})

const loading = ref(true)
onMounted(async () => {
  if (donationStore.donationList.length === 0) {
    await donationStore.fetchDonation(donationId.value)
  }
  loading.value = false
})
</script>
