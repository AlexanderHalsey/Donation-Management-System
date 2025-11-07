<template>
  <Page title="Nouveau don" :breadcrumbs="breadcrumbs"> Hello </Page>
</template>

<script setup lang="ts">
import Page from '@/layouts/Page.vue'

import type { Breadcrumb } from '@/types'

const breadcrumbs: Breadcrumb[] = [
  { id: 'donation-list', label: 'Liste des dons', to: '/donations', icon: 'volunteer_activism' },
  { id: 'donation-create', label: 'Nouveau don', icon: 'add' },
]
</script>
